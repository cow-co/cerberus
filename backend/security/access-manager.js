// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const dbUserManager = require("./database-manager");
const adUserManager = require("./active-directory-manager");
const { extractUserDetails } = require("./pki");
const { findUser } = require("../db/services/user-service");
const { isUserAdmin } = require("../db/services/admin-service");

// Basically checks the provided credentials
const authenticate = async (req, res, next) => {
  log("access-manager#authenticate", "Authenticating...", levels.DEBUG);
  let username = null;
  let password = null;
  let errors = [];
  let status = statusCodes.BAD_REQUEST;

  if (securityConfig.usePKI) {
    username = extractUserDetails(req);
  } else {
    username = req.body.username;
    password = req.body.password;
  }
  let authenticated = false;

  username = username.trim();

  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        authenticated = await dbUserManager.authenticate(username, password);
        break;
      case securityConfig.availableAuthMethods.AD:
        authenticated = await adUserManager.authenticate(username, password);
        break;

      default:
        log(
          "authenticate",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        status = statusCodes.INTERNAL_SERVER_ERROR;
        break;
    }
  } catch (err) {
    log("authenticate", err, levels.ERROR);
    errors.push("Internal Server Error");
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  if (!authenticated && errors.length === 0) {
    log("authenticate", `User failed login`, levels.WARN);
    status = statusCodes.UNAUTHENTICATED;
    errors.push("Incorrect login credentials");
    res.status(status).json({ errors });
  } else if (errors.length > 0) {
    res.status(status).json({ errors });
  } else {
    req.session.username = username;
    next();
  }
};

// Checks that the session cookie is valid; if not, redirects to the login page
const verifySession = async (req, res, next) => {
  log(
    "verifySession",
    "Verifying Session..." + JSON.stringify(req.session.username),
    levels.DEBUG
  );
  if (req.session.username) {
    next();
  } else {
    // We attempt to sort the session out automatically if PKI is enabled, since we don't need the user
    // to manually submit anything
    if (securityConfig.usePKI) {
      authenticate(req, res, next);
    } else {
      res.status(statusCodes.FORBIDDEN).json({ errors: ["Invalid session"] });
    }
  }
};

// Destroys the stored session token
const logout = async (session) => {
  session.destroy();
};

// Creates a user - specifically for DB-backed user management.
// Returns an error if user management is AD-backed.
// In a proper environment we'd probably want email verification. TBH we'd want AD auth anyway so it's kinda moot
const register = async (username, password) => {
  username = username.trim();
  let response = {
    userId: null,
    errors: [],
  };

  if (securityConfig.authMethod === securityConfig.availableAuthMethods.AD) {
    response.errors.push(
      "Registering is not supported for AD-backed auth; please ask your Active Directory administrator to add you."
    );
  } else {
    const createdUser = await dbUserManager.register(username, password);
    response.userId = createdUser._id;
  }

  return response;
};

const checkAdmin = async (req, res, next) => {
  const username = req.session.username;
  let isAdmin = false;

  if (username) {
    const user = await findUser(username);
    isAdmin = await isUserAdmin(user._id);
  }

  if (!isAdmin) {
    log("checkAdmin", "User is not an admin", levels.WARN);
    res
      .status(statusCodes.FORBIDDEN)
      .json({ errors: ["You must be an admin to do this"] });
  } else {
    next();
  }
};

module.exports = {
  authenticate,
  verifySession,
  logout,
  register,
  checkAdmin,
};
