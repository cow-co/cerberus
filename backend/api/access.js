const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");

/**
 * Expects request body to contain:
 * - username
 * - password
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
 * - username
 * - password
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
    try {
      if (req.data.userId !== userId) {
        log(
          "DELETE /access/logout",
          `User ${req.data.userId} attempted to log someone else out (${userId})!`,
          levels.SECURITY
        );
        res
          .status(statusCodes.FORBIDDEN)
          .json({ errors: ["You cannot log another user out!"] });
      } else {
        await accessManager.logout(userId);
        res.status(statusCodes.OK).json({ errors: [] });
        log("DELETE /access/logout", `User ${userId} logged out`, levels.DEBUG);
      }
    } catch (err) {
      log("DELETE /access/logout", err, levels.ERROR);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ errors: ["Internal Server Error"] });
    }
  }
);

/**
 * Changes admin status of the user.
 * Expects request body to contain:
 * - userId (string)
 * - makeAdmin (boolean)
 */
router.put(
  "/admin",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    const userId = req.bodyString("userId");
    log(
      "PUT /access/admin",
      `Changing admin status of ${userId} to ${req.body.makeAdmin}`,
      levels.INFO
    );
    let status = statusCodes.OK;
    let response = {
      errors: [],
    };
    const chosenUser = userId.trim();

    try {
      const result = await accessManager.findUserById(chosenUser);
      if (result.user) {
        if (Boolean(req.body.makeAdmin)) {
          await adminService.addAdmin(result.user.id);
        } else {
          await adminService.removeAdmin(result.user.id);
        }
      } else {
        log(
          "PUT /access/admin",
          "Tried to make a non-existent user into an admin",
          levels.WARN
        );
        status = statusCodes.BAD_REQUEST;
        response.errors.push("User not found");
      }
    } catch (err) {
      log("PUT /access/admin", err, levels.ERROR);
      response.errors = ["Internal Server Error"];
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }

    res.status(status).json(response);
  }
);

module.exports = router;
