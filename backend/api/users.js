const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const accessManager = require("../security/user-and-access-manager");
const adminService = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");

router.get("/user/:username", accessManager.verifySession, async (req, res) => {
  log(
    `GET /users/user/${req.params.username}`,
    `getting user ${req.params.username}`,
    levels.INFO
  );
  let status = statusCodes.OK;
  let response = {
    user: null,
    errors: [],
  };

  const chosenUser = req.params.username.trim();

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
  accessManager.verifySession,
  accessManager.checkAdmin,
  async (req, res) => {
    log(
      `DELETE /users/user/${req.params.userId}`,
      `Deleting user ${req.params.userId}`,
      levels.INFO
    );
    let status = statusCodes.OK;
    let response = {
      errors: [],
    };
    const chosenUser = req.params.userId.trim();

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
          `DELETE /users/user/${req.params.userId}`,
          `User with ID ${req.params.userId} does not exist`,
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

router.get("/check-session", accessManager.verifySession, async (req, res) => {
  const { user } = await accessManager.findUserByName(req.session.username);
  const isAdmin = await adminService.isUserAdmin(user.id);

  let status = statusCodes.OK;
  let response = {
    username: req.session.username,
    isAdmin,
    errors: [],
  };

  res.status(status).json(response);
});

module.exports = router;
