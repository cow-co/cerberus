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
  const username = req.body.username;
  const password = req.body.password;

  let responseStatus = statusCodes.OK;
  let responseJSON = {
    errors: [],
  };

  try {
    const result = await accessManager.register(username, password);

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
router.post("/login", accessManager.authenticate, (req, res) => {
  console.log("BLAH!");
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

router.delete("/logout/:userId", async (req, res) => {
  try {
    await accessManager.logout(req.params.userId);
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
router.put(
  "/admin",
  accessManager.verifyToken,
  accessManager.checkAdmin,
  async (req, res) => {
    log(
      "/admin",
      `Changing admin status of ${req.body.userId} to ${req.body.makeAdmin}`,
      levels.INFO
    );
    let status = statusCodes.OK;
    let response = {
      errors: [],
    };
    const chosenUser = req.body.userId.trim();

    try {
      const result = await accessManager.findUserById(chosenUser);
      if (result.user) {
        if (req.body.makeAdmin) {
          await adminService.addAdmin(result.user.id);
        } else {
          await adminService.removeAdmin(result.user.id);
        }
      } else {
        log(
          "/admin",
          "Tried to make a non-existent user into an admin",
          levels.WARN
        );
        status = statusCodes.BAD_REQUEST;
        response.errors.push("User not found");
      }
    } catch (err) {
      log("/admin", err, levels.ERROR);
      response.errors = ["Internal Server Error"];
      status = statusCodes.INTERNAL_SERVER_ERROR;
    }

    res.status(status).json(response);
  }
);

module.exports = router;
