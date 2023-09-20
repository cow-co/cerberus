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
  // TODO Handle this properly (redirects, whatever.)
  if (req.session.username) {
    console.log(`NOICE ${JSON.stringify(req.session)}`);
    res
      .status(statusCodes.OK)
      .json({ username: req.session.username, errors: [] });
    //res.redirect("/");
  } else {
    // TODO Error stuffs
  }
});

module.exports = router;
