const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const {
  authenticate,
  verifySession,
  checkAdmin,
  logout,
  register,
} = require("../security/user-and-access-manager");
const { findUserById } = require("../db/services/user-service");
const { addAdmin, removeAdmin } = require("../db/services/admin-service");
const ResponseDTO = require("./dto/ResponseDTO");

/**
 * Expects request body to contain:
 * - username
 * - password
 */
router.post("/register", async (req, res) => {
  const username = req.body.username; // TODO Should trim this - and test!
  const password = req.body.password;

  let responseStatus = statusCodes.OK;
  let errors = [];

  const result = await register(username, password);

  if (result.errors.length > 0) {
    errors = result.errors;
    responseStatus = statusCodes.BAD_REQUEST;
  }

  const responseJSON = new ResponseDTO(result._id, errors);
  res.status(responseStatus).json(responseJSON);
});

/**
 * Expects request body to contain:
 * - username
 * - password
 */
router.post("/login", authenticate, async (req, res) => {
  const response = new ResponseDTO(req.session.username, []);
  res.status(statusCodes.OK).json(response);
});

router.delete("/logout", verifySession, async (req, res) => {
  const response = new ResponseDTO(req.session.username, []);
  logout(req.session);
  res.status(statusCodes.OK).json(response);
});

/**
 * Changes admin status of the user.
 * Expects req.body to contain:
 * - userId (string)
 * - makeAdmin (boolean)
 */
router.put("/admin", verifySession, checkAdmin, async (req, res) => {
  let status = statusCodes.OK;
  let errors = [];

  const chosenUser = req.body.userId.trim();
  const user = await findUserById(chosenUser); // TODO this should go to the user manager, in order to support AD auth
  if (user) {
    if (req.body.makeAdmin) {
      await addAdmin(user._id);
    } else {
      await removeAdmin(user._id);
    }
  } else {
    status = statusCodes.BAD_REQUEST;
    errors.push("User not found");
  }

  const response = new ResponseDTO(user._id, errors);
  res.status(status).json(response);
});

module.exports = router;
