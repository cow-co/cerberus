const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const {
  verifySession,
  checkAdmin,
  removeUser,
} = require("../security/access-manager");
const { findUser, findUserById } = require("../db/services/user-service");

router.get("/:username", verifySession, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    user: {},
    errors: [],
  };

  const chosenUser = req.params.username.trim();
  const user = await findUser(chosenUser);
  const strippedUser = {
    _id: user._id,
    name: user.name,
  };
  if (user) {
    response.user = strippedUser;
  } else {
    status = statusCodes.BAD_REQUEST;
    response.errors.push("User not found");
  }

  res.status(status).json(response);
});

// TODO Test that only admins can do this
router.delete("/:userId", verifySession, checkAdmin, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    errors: [],
  };

  const chosenUser = req.params.userId.trim();
  const errors = await removeUser(chosenUser);
  response.errors = errors;
  if (errors.length > 0) {
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }
  res.status(status).json(response);
});

module.exports = router;
