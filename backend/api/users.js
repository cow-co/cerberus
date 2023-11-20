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
    user: null,
    errors: [],
  };

  const chosenUser = username.trim();

  try {
    const result = await accessManager.findUserByName(chosenUser);
    if (result.user) {
      response.user = {
        id: result.user.id,
        name: result.user.name,
      };
    }
  } catch (err) {
    log("GET /user/:username", err, levels.ERROR);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors = ["Internal Server Error"];
  }

  res.status(status).json(response);
});

router.delete(
  "/user/:userId",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    const userId = req.paramString("userId");
    log(`DELETE /users/user/${userId}`, `Deleting user ${userId}`, levels.INFO);
    let status = statusCodes.OK;
    let response = {
      errors: [],
    };
    const chosenUser = userId.trim();

    try {
      const result = await accessManager.findUserById(chosenUser);
      if (result.user) {
        const errors = await accessManager.removeUser(chosenUser);
        response.errors = errors;
        if (errors.length > 0) {
          status = statusCodes.INTERNAL_SERVER_ERROR;
        }
      } else {
        log(
          `DELETE /users/user/${userId}`,
          `User with ID ${userId} does not exist`,
          levels.WARN
        );
      }
    } catch (err) {
      log("DELETE /user/:userId", err, levels.ERROR);
      status = statusCodes.INTERNAL_SERVER_ERROR;
      response.errors = ["Internal Server Error"];
    }

    res.status(status).json(response);
  }
);

router.get("/whoami", accessManager.verifyToken, async (req, res) => {
  log("GET /users/whoami", "Checking user status...", levels.DEBUG);
  let response = {};
  let status = statusCodes.OK;

  try {
    const { user } = await accessManager.findUserById(req.data.userId);
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

module.exports = router;
