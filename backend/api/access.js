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
const { findUserById } = require("../security/user-and-access-manager");
const { addAdmin, removeAdmin } = require("../db/services/admin-service");
const { log, levels } = require("../utils/logger");

/**
 * Expects request body to contain:
 * - username
 * - password
 */
router.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let responseStatus = statusCodes.OK;
  let responseJSON = {
    errors: [],
  };

  try {
    const result = await register(username, password);

    if (result.errors.length > 0) {
      responseJSON.errors = result.errors;
      responseStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    log("/register", err, levels.ERROR);
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
router.post("/login", authenticate, async (req, res) => {
  res
    .status(statusCodes.OK)
    .json({ username: req.session.username, errors: [] });
});

router.delete("/logout", verifySession, async (req, res) => {
  try {
    logout(req.session);
    res.status(statusCodes.OK).json({ errors: [] });
  } catch (err) {
    log("/logout", err, levels.ERROR);
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ errors: ["Internal Server Error"] });
  }
});

/**
 * Changes admin status of the user.
 * Expects request body to contain:
 * - userId (string)
 * - makeAdmin (boolean)
 */
router.put("/admin", verifySession, checkAdmin, async (req, res) => {
  let status = statusCodes.OK;
  let response = {
    errors: [],
  };
  const chosenUser = req.body.userId.trim();

  try {
    const result = await findUserById(chosenUser);
    if (result.user) {
      if (req.body.makeAdmin) {
        await addAdmin(result.user.id);
      } else {
        await removeAdmin(result.user.id);
      }
    } else {
      status = statusCodes.BAD_REQUEST;
      response.errors.push("User not found");
    }
  } catch (err) {
    log("/admin", err, levels.ERROR);
    response.errors = ["Internal Server Error"];
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  res.status(status).json(response);
});

module.exports = router;
