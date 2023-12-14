const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");

router.get("/user/:username", accessManager.verifyToken, async (req, res) => {
  const username = req.paramString("username");
  log(`GET /users/user/${username}`, `Getting user ${username}`, levels.DEBUG);
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
    const permitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.USER,
      result.user.id,
      accessManager.accessControlType.READ,
      req.data.userId
    );

    if (permitted) {
      response.user = {
        id: result.user.id,
        name: result.user.name,
      };
    } else {
      response.errors.push("Not permitted");
      status = statusCodes.FORBIDDEN;
    }
  } catch (err) {
    log("GET /user/:username", err, levels.ERROR);
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

    if (!result.user.id) {
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
      const errors = await accessManager.removeUser(userId);
      if (errors.length > 0) {
        response.errors = errors;
        status = statusCodes.INTERNAL_SERVER_ERROR;
      }
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
  console.log(JSON.stringify(req.data))

  try {
    const { user } = await accessManager.findUserById(req.data.userId);
    const isAdmin = await adminService.isUserAdmin(req.data.userId);

    console.log(JSON.stringify(user));

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

module.exports = router;
