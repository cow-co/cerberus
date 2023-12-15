const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");
const implantService = require("../db/services/implant-service");

/**
 * Expects request body to contain:
 * - username {String}
 * - password {String}
 */
router.post("/register", async (req, res) => {
  log(
    "POST /access/register",
    `User registering with username ${req.body.username}`,
    levels.DEBUG
  );
  const username = req.bodyString("username");
  const password = req.bodyString("password");

  let responseStatus = statusCodes.OK;
  let responseJSON = {
    errors: [],
  };

  try {
    const result = await accessManager.register(username, password);

    if (result.errors.length > 0) {
      log(
        "POST /access/register",
        `Errors: ${JSON.stringify(result.errors)}`,
        levels.DEBUG
      );
      responseJSON.errors = result.errors;
      responseStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    log("POST /register", err, levels.ERROR);
    responseJSON.errors = ["Internal Server Error"];
    responseStatus = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(responseStatus).json(responseJSON);
});

/**
 * Expects request body to contain:
 * - username {String}
 * - password {String}
 */
router.post("/login", accessManager.authenticate, (req, res) => {
  log(
    "POST /access/login",
    `User ${req.data.username} (${req.data.userId}) logged in`,
    levels.DEBUG
  );
  res.status(statusCodes.OK).json({
    token: req.data.token,
    user: {
      id: req.data.userId,
      name: req.data.username,
      isAdmin: req.data.isAdmin,
    },
    errors: [],
  });
});

router.delete(
  "/logout/:userId",
  accessManager.verifyToken,
  async (req, res) => {
    const userId = req.paramString("userId");

    log("DELETE /access/logout", `Logging out user ${userId}`, levels.DEBUG);

    let status = statusCodes.OK;
    let errors = [];

    try {
      if (req.data.userId !== userId) {
        log(
          "DELETE /access/logout",
          `User ${req.data.userId} attempted to log someone else out (${userId})!`,
          levels.SECURITY
        );

        status = statusCodes.FORBIDDEN;
        errors.push("You cannot log another user out!");
      } else {
        await accessManager.logout(userId);
        status = statusCodes.OK;

        log("DELETE /access/logout", `User ${userId} logged out`, levels.DEBUG);
      }
    } catch (err) {
      log("DELETE /access/logout", err, levels.ERROR);

      status = statusCodes.INTERNAL_SERVER_ERROR;
      errors.push("Internal Server Error");
    }

    res.status(status).json({ errors });
  }
);

/**
 * Changes admin status of the user.
 * Expects request body to contain:
 * - userId {String}
 * - makeAdmin {Boolean}
 */
router.put("/admin", accessManager.verifyToken, async (req, res) => {
  const userId = req.bodyString("userId");
  const makeAdmin = Boolean(req.body.makeAdmin);

  log(
    "PUT /access/admin",
    `Changing admin status of ${userId} to ${makeAdmin}`,
    levels.INFO
  );

  let status = statusCodes.OK;
  let response = {
    errors: [],
  };

  try {
    const permitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.USER,
      userId,
      accessManager.accessControlType.ADMIN,
      req.data.userId
    );
    if (permitted) {
      const result = await accessManager.findUserById(userId);
      if (result.user) {
        await adminService.changeAdminStatus(userId, makeAdmin);
      } else {
        log(
          "PUT /access/admin",
          "Tried to make a non-existent user into an admin",
          levels.WARN
        );

        status = statusCodes.BAD_REQUEST;
        response.errors.push("User not found");
      }
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to change admin status");

      log(
        "PUT /access/admin",
        `Non-admin user ${req.data.userId} attempted to change admin status`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("PUT /access/admin", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.post(
  "/implants/:implantId/acgs",
  accessManager.verifyToken,
  async (req, res) => {
    const implantId = req.paramString("implantId");

    log(
      `POST /access/implants/${implantId}/acgs`,
      `Updating the ACGs for implant ${implantId}`,
      levels.INFO
    );

    let status = statusCodes.OK;
    let response = {
      implant: {},
      errors: [],
    };

    try {
      const permitted = await accessManager.authZCheck(
        accessManager.operationType.EDIT,
        accessManager.targetEntityType.IMPLANT,
        implantId,
        accessManager.accessControlType.ADMIN,
        req.data.userId
      );
      if (permitted) {
        const updated = await implantService.updateACGs(
          implantId,
          req.body.readOnlyACGs,
          req.body.operatorACGs
        );
        if (updated) {
          response.implant = updated;
        } else {
          log(
            `POST /access/implants/${implantId}/acgs`,
            `Implant ${implantId} not found`,
            levels.WARN
          );

          status = statusCodes.BAD_REQUEST;
          response.errors.push("Could not find implant");
        }
      } else {
        status = statusCodes.FORBIDDEN;
        response.errors.push("Not authorised to update ACGs");

        log(
          `POST /access/implants/${implantId}/acgs`,
          `Non-admin user ${req.data.userId} attempted to change ACGs`,
          levels.SECURITY
        );
      }
    } catch (err) {
      log(`POST /access/implants/${implantId}/acgs`, err, levels.ERROR);

      response.errors = ["Internal Server Error"];
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }

    res.status(status).json(response);
  }
);

router.put("/acgs", accessManager.verifyToken, async (req, res) => {
  log(
    "PUT /acgs",
    "Creating a new ACG...",
    levels.INFO
  );

  let response = {
    errors: []
  };
  let status = statusCodes.OK;

  try {
    const permitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.USER,
      null,
      accessManager.accessControlType.ADMIN,
      req.data.userId
    );

    if (permitted) {
      // TODO THIS
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to update ACGs");

      log(
        "PUT /acgs",
        `Non-admin user ${req.data.userId} attempted to add an ACG`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("PUT /acgs", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.get("/acgs", accessManager.verifyToken, async (req, res) => {
  log(
    "GET /acgs",
    "Getting ACGs...",
    levels.DEBUG
  );

  let response = {
    groups: [],
    errors: []
  };
  let status = statusCodes.OK;

  try {
    const permitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.USER,
      null,
      accessManager.accessControlType.ADMIN,
      req.data.userId
    );

    if (permitted) {
      response = await accessManager.getAllGroups();
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to list ACGs");

      log(
        "GET /acgs",
        `Non-admin user ${req.data.userId} attempted to get the ACGs list`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("GET /acgs", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

module.exports = router;
