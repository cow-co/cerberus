const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");

// TODO A Password-change capability?

router.get("/user/:username", accessManager.verifyToken, async (req, res) => {
  const username = req.paramString("username");
  log(`GET /users/user/${username}`, `Getting user ${username}`, levels.INFO);
  let status = statusCodes.OK;
  let response = {
    user: {
      id: "",
      name: "",
    },
    errors: [],
  };

  const chosenUser = username.trim();

  try {
    const result = await accessManager.findUserByName(chosenUser);
    if (result.id) {
      const permitted = await accessManager.authZCheck(
        accessManager.operationType.READ,
        accessManager.targetEntityType.USER,
        result.id,
        accessManager.accessControlType.READ,
        req.data.userId
      );

      if (permitted) {
        const isAdmin = await adminService.isUserAdmin(result.id);
        response.user = {
          id: result.id,
          name: result.name,
          isAdmin,
          acgs: result.acgs,
        };
      } else {
        response.errors.push("Not permitted");
        status = statusCodes.FORBIDDEN;
      }
    } else {
      log("GET /user/:username", "Could not find user!", levels.WARN);
      status = statusCodes.BAD_REQUEST;
      response.errors = ["Could not find user!"];
    }
  } catch (err) {
    log("GET /user/:username", err, levels.ERROR);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors = ["Internal Server Error"];
  }

  res.status(status).json(response);
});

/**
 * Updates the user's password
 */
router.post("/user/:id", accessManager.verifyToken, async (req, res) => {
  const userId = req.paramString("id");
  const newPassword = req.bodyString("password");
  const newPasswordConfirmation = req.bodyString("confirmPassword");

  log(
    `POST /users/user/${userId}`,
    `Changing password for user ${userId}`,
    levels.INFO
  );
  console.log(newPassword);
  console.log(newPasswordConfirmation);
  let status = statusCodes.OK;
  let response = {
    errors: [],
  };

  const chosenUser = userId.trim();

  try {
    const result = await accessManager.findUserById(chosenUser);
    if (result.id) {
      const permitted = await accessManager.authZCheck(
        accessManager.operationType.EDIT,
        accessManager.targetEntityType.USER,
        result.id,
        accessManager.accessControlType.EDIT,
        req.data.userId
      );

      if (permitted) {
        response.errors = await accessManager.changePassword(
          result.id,
          newPassword,
          newPasswordConfirmation
        );
        if (response.errors.length > 0) {
          status = statusCodes.BAD_REQUEST;
        }
      } else {
        log("POST /user/:id", "Not permitted", levels.SECURITY);
        response.errors.push("Not permitted");
        status = statusCodes.FORBIDDEN;
      }
    } else {
      log("POST /user/:id", "Could not find user!", levels.WARN);
      status = statusCodes.BAD_REQUEST;
      response.errors = ["Could not find user!"];
    }
  } catch (err) {
    log("POST /user/:id", err, levels.ERROR);
    log("++++++++++++++++++++++++++++++++++++++++++++++++", err, levels.FATAL);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors = ["Internal Server Error"];
  }

  res.status(status).json(response);
});

router.delete("/user/:userId", accessManager.verifyToken, async (req, res) => {
  const userId = req.paramString("userId");
  log(`DELETE /users/user/${userId}`, `Deleting user ${userId}`, levels.INFO);
  let status = statusCodes.OK;
  let response = {
    errors: [],
  };

  try {
    const result = await accessManager.findUserById(userId);

    if (!result.id) {
      log(
        `DELETE /users/user/${userId}`,
        `User with ID ${userId} does not exist`,
        levels.WARN
      );
    }

    const permitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.USER,
      userId,
      accessManager.accessControlType.ADMIN,
      req.data.userId
    );

    if (permitted) {
      await accessManager.removeUser(userId);
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not permitted");
    }
  } catch (err) {
    log("DELETE /user/:userId", err, levels.ERROR);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors = ["Internal Server Error"];
  }

  res.status(status).json(response);
});

router.get("/whoami", accessManager.verifyToken, async (req, res) => {
  log("GET /users/whoami", "Checking user status...", levels.DEBUG);
  let response = {};
  let status = statusCodes.OK;

  try {
    const user = await accessManager.findUserById(req.data.userId);
    const isAdmin = await adminService.isUserAdmin(req.data.userId);

    status = statusCodes.OK;
    response = {
      user: {
        id: req.data.userId,
        name: user.name,
        isAdmin: isAdmin,
      },
      errors: [],
    };
  } catch (err) {
    log("GET /users/whoami", err, levels.ERROR);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response = {
      errors: ["Internal Server Error"],
    };
  }

  res.status(status).json(response);
});

/**
 * If user is admin, they can check any user's groups
 * else, they can only check their own groups
 */
router.get(
  "/user/:userId/groups",
  accessManager.verifyToken,
  async (req, res) => {
    log(
      "GET /users/user/:userId/groups",
      "Checking user groups...",
      levels.DEBUG
    );

    const userId = req.paramString("userId");
    let response = {
      groups: [],
      errors: [],
    };
    let status = statusCodes.OK;

    try {
      const permitted = await accessManager.authZCheck(
        accessManager.operationType.READ,
        accessManager.targetEntityType.USER,
        userId,
        accessManager.accessControlType.READ,
        req.data.userId
      );

      if (permitted) {
        const { groups, errors } = await accessManager.getGroupsForUser(userId);
        response.errors = errors;
        response.groups = groups;
      } else {
        status = statusCodes.FORBIDDEN;
        response.errors.push("Not permitted");
      }
    } catch (err) {
      log("GET /users/user/:userId/groups", err, levels.ERROR);
      status = statusCodes.INTERNAL_SERVER_ERROR;
      response.errors = ["Internal Server Error"];
    }

    res.status(status).json(response);
  }
);

router.post(
  "/user/:userId/groups",
  accessManager.verifyToken,
  async (req, res) => {
    log(
      "POST /users/user/:userId/groups",
      "Adding user groups...",
      levels.DEBUG
    );

    const userId = req.paramString("userId");
    let response = {
      groups: [],
      errors: [],
    };
    let status = statusCodes.OK;

    try {
      const permitted = await accessManager.authZCheck(
        accessManager.operationType.EDIT,
        accessManager.targetEntityType.USER,
        userId,
        accessManager.accessControlType.ADMIN,
        req.data.userId
      );

      if (permitted) {
        await accessManager.editUserGroups(req.body.groups, userId);
      } else {
        status = statusCodes.FORBIDDEN;
        response.errors.push("Not permitted");
      }
    } catch (err) {
      log("GET /users/user/:userId/groups", err, levels.ERROR);
      status = statusCodes.INTERNAL_SERVER_ERROR;
      response.errors = ["Internal Server Error"];
    }

    res.status(status).json(response);
  }
);

module.exports = router;
