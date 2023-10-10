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
const { ResponseDTO } = require("./dto/ResponseDTO");

// TODO update to use access-manager findUser method

router.get("/user/:username", verifySession, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    user: {},
    errors: [],
  };

  const chosenUser = req.params.username.trim();
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

  res.status(status).json(response);
});

router.delete("/user/:userId", verifySession, checkAdmin, async (req, res) => {
  let status = statusCodes.OK;
  let errors = [];

  const chosenUser = req.params.userId.trim();
  const result = await findUserById(chosenUser);
  if (!result.user) {
    errors = result.errors;
    status = statusCodes.BAD_REQUEST;
  } else {
    errors = await removeUser(chosenUser);
    if (errors.length > 0) {
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }
  }
  const response = new ResponseDTO(chosenUser, errors);
  res.status(status).json(response);
});

router.get("/check-session", verifySession, async (req, res) => {
  let status = statusCodes.OK;
  const response = new ResponseDTO(req.session.username, []);
  res.status(status).json(response);
});

module.exports = router;
