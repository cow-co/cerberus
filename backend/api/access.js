const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");
const implantService = require("../db/services/implant-service");
const securityConfig = require("../config/security-config");

/**
 * Expects request body to contain:
 * - username {String}
 * - password {String}
 */
router.post("/register", async (req, res) => {
  log("POST /access/register", `User registering`, levels.DEBUG);
  let username = null;
  let password = null;
  let confirmPassword = null;

  if (securityConfig.usePKI) {
    username = accessManager.extractUserDetailsFromCert(req);
  } else {
    username = req.bodyString("username");
    password = req.bodyString("password");
    confirmPassword = req.bodyString("confirmPassword");
  }

  let responseStatus = statusCodes.OK;
  let response = {
    errors: [],
  };

  try {
    const result = await accessManager.register(
      username,
      password,
      confirmPassword
    );

    if (result.errors.length > 0) {
      log(
        "POST /access/register",
        `Errors: ${JSON.stringify(result.errors)}`,
        levels.DEBUG
      );
      response.errors = result.errors;
      responseStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    log("POST /register", err, levels.ERROR);
    response.errors = ["Internal Server Error"];
    responseStatus = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(responseStatus).json(response);
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
      isAdmin: req.data.isAdmin, // This is only used on the client side so it's ok; any calls are re-checked against the auth store
    },
    errors: [],
  });
});

router.delete("/logout", accessManager.verifyToken, async (req, res) => {
  log(
    "DELETE /access/logout",
    `Logging out user ${req.data.userId}`,
    levels.DEBUG
  );

  let status = statusCodes.OK;
  let errors = [];

  try {
    await accessManager.logout(req.data.userId);
    status = statusCodes.OK;

    log(
      "DELETE /access/logout",
      `User ${req.data.userId} logged out`,
      levels.DEBUG
    );
  } catch (err) {
    log("DELETE /access/logout", err, levels.ERROR);

    status = statusCodes.INTERNAL_SERVER_ERROR;
    errors.push("Internal Server Error");
  }

  res.status(status).json({ errors });
});

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
    const operation = {
      userId: req.data.userId,
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.ADMIN,
    };
    const target = {
      entityType: accessManager.targetEntityType.USER,
      entityId: userId,
    };
    const permitted = await accessManager.authZCheck(operation, target);
    if (permitted) {
      const result = await accessManager.findUserById(userId);
      if (result.id) {
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
      const operation = {
        userId: req.data.userId,
        type: accessManager.operationType.EDIT,
        accessControlType: accessManager.accessControlType.ADMIN,
      };
      const target = {
        entityType: accessManager.targetEntityType.IMPLANT,
        entityId: implantId,
      };
      const permitted = await accessManager.authZCheck(operation, target);
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

router.post("/acgs", accessManager.verifyToken, async (req, res) => {
  log("POST /acgs", "Creating a new ACG...", levels.INFO);

  let response = {
    errors: [],
  };
  let status = statusCodes.OK;

  try {
    const operation = {
      userId: req.data.userId,
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.ADMIN,
    };
    const target = {
      entityType: accessManager.targetEntityType.USER,
      entityId: null,
    };
    const permitted = await accessManager.authZCheck(operation, target);

    if (permitted) {
      response.errors = await accessManager.createGroup(req.bodyString("name"));

      if (response.errors.length > 0) {
        log("POST /access/acgs", JSON.stringify(response.errors), levels.WARN);

        status = statusCodes.INTERNAL_SERVER_ERROR;
      }
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to update ACGs");

      log(
        "POST /access/acgs",
        `Non-admin user ${req.data.userId} attempted to add an ACG`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("PUT /access/acgs", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.get("/acgs", accessManager.verifyToken, async (req, res) => {
  log("GET /access/acgs", "Getting ACGs...", levels.DEBUG);

  let response = {
    groups: [],
    errors: [],
  };
  let status = statusCodes.OK;

  try {
    const operation = {
      userId: req.data.userId,
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.ADMIN,
    };
    const target = {
      entityType: accessManager.targetEntityType.USER,
      entityId: null,
    };
    const permitted = await accessManager.authZCheck(operation, target);

    if (permitted) {
      response = await accessManager.getAllGroups();
      if (response.errors.length > 0) {
        log("GET /access/acgs", JSON.stringify(response.errors), levels.WARN);

        status = statusCodes.INTERNAL_SERVER_ERROR;
      }
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to list ACGs");

      log(
        "GET /access/acgs",
        `Non-admin user ${req.data.userId} attempted to get the ACGs list`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("GET /access/acgs", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.delete("/acgs/:acgId", accessManager.verifyToken, async (req, res) => {
  const acgId = req.paramString("acgId");
  log("DELETE /access/acgs", `Deleting ACG ${acgId}`, levels.DEBUG);

  let response = {
    deletedEntity: null,
    errors: [],
  };
  let status = statusCodes.OK;

  try {
    const operation = {
      userId: req.data.userId,
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.ADMIN,
    };
    const target = {
      entityType: accessManager.targetEntityType.USER,
      entityId: null,
    };
    const permitted = await accessManager.authZCheck(operation, target);

    if (permitted) {
      response = await accessManager.deleteGroup(acgId);
      if (response.errors.length > 0) {
        log(
          "DELETE /access/acgs",
          JSON.stringify(response.errors),
          levels.WARN
        );

        status = statusCodes.BAD_REQUEST;
      } else if (!response.deletedEntity) {
        log(
          "DELETE /access/acgs",
          `Attempted to delete non-existent ACG with ID ${acgId}`,
          levels.WARN
        );
      }
    } else {
      status = statusCodes.FORBIDDEN;
      response.errors.push("Not authorised to delete ACGs");

      log(
        "DELETE /access/acgs",
        `Non-admin user ${req.data.userId} attempted to delete an ACG`,
        levels.SECURITY
      );
    }
  } catch (err) {
    log("DELETE /access/acgs", err, levels.ERROR);

    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

router.get("/config", (req, res) => {
  const response = {
    pkiEnabled: securityConfig.usePKI,
    passwordReqs: securityConfig.passwordRequirements,
  };
  res.status(statusCodes.OK).json(response);
});

module.exports = router;
