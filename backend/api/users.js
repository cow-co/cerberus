const express = require("express");
const router = express.Router();
const userManager = require("../users/user-manager");
const statusCodes = require("../config/statusCodes");
const { validatePassword } = require("../validation/security-validation");

// Expects request body to contain:
// - username
// - password
router.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let responseStatus = statusCodes.OK;
  let responseJSON = {
    errors: [],
  };

  const validationErrors = validatePassword(password);

  if (validationErrors.length === 0) {
    const result = await userManager.register(username, password);

    if (result.errors.length > 0) {
      responseJSON.errors = result.errors;
      responseStatus = statusCodes.BAD_REQUEST;
    }
  } else {
    responseJSON.errors = responseJSON.errors.concat(validationErrors);
    responseStatus = statusCodes.BAD_REQUEST;
  }

  res.status(responseStatus).json(responseJSON);
});

// Expects request body to contain:
// - username
// - password
router.post("/login", userManager.authenticate, async (req, res) => {
  if (req.session.username) {
    res
      .status(statusCodes.OK)
      .json({ username: req.session.username, errors: [] });
  } else {
    res
      .status(statusCodes.UNAUTHENTICATED)
      .json({ username: null, errors: res.locals.errors });
  }
});

router.delete("/logout", userManager.authenticate, async (req, res) => {
  userManager.logout(req.session);
  res.redirect("/");
});

module.exports = router;
