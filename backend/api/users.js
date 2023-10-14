const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const {
  verifySession,
  checkAdmin,
  removeUser,
  findUserByName,
  findUserById,
} = require("../security/user-and-access-manager");
const { log, levels } = require("../utils/logger");

router.get("/user/:username", verifySession, async (req, res) => {
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
    const result = await findUserByName(chosenUser);
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

router.delete("/user/:userId", verifySession, checkAdmin, async (req, res) => {
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
    const result = await findUserById(chosenUser);
    if (result.user) {
      const errors = await removeUser(chosenUser);
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
});

router.get("/check-session", verifySession, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    username: req.session.username,
  };
  res.status(status).json(response);
});

module.exports = router;
