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
  let status = statusCodes.OK;
  let response = {
    user: {},
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
    } else {
      status = statusCodes.BAD_REQUEST;
      response.errors.push("User not found");
    }
  } catch (err) {
    log("GET /user/:username", err, levels.ERROR);
    status = statusCodes.INTERNAL_SERVER_ERROR;
    response.errors = ["Internal Server Error"];
  }

  res.status(status).json(response);
});

router.delete("/user/:userId", verifySession, checkAdmin, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    errors: [],
  };
  const chosenUser = req.params.userId.trim();

  try {
    const result = await findUserById(chosenUser);
    if (!result.user) {
      response.errors = result.errors;
      status = statusCodes.BAD_REQUEST;
    } else {
      const errors = await removeUser(chosenUser);
      response.errors = errors;
      if (errors.length > 0) {
        status = statusCodes.INTERNAL_SERVER_ERROR;
      }
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
