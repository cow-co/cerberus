const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const { verifySession } = require("../security/access-manager");
const { findUser } = require("../db/services/user-service");

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

module.exports = router;
