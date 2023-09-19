// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const dbUserManager = require("./database-manager");
const { extractUserDetails } = require("../security/pki");

// Basically logs a user in sits in front of the POST /login endpoint
const authenticate = async (req, res, next) => {
  let username = null;
  let password = null;

  if (securityConfig.usePKI) {
    username = extractUserDetails(req);
  } else {
    // TODO extract username and password from request body
  }

  let authenticated = false;

  // TODO wrap in try/catch
  switch (securityConfig.authMethod) {
    case securityConfig.availableAuthMethods.DB:
      authenticated = await dbUserManager.authenticate(username, password);
      break;
    case securityConfig.availableAuthMethods.AD:
      // TODO Do an auth check
      break;

    default:
      log(
        "authenticate",
        `Auth method ${securityConfig.authMethod} not supported`,
        levels.ERROR
      );
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ errors: ["Internal Server Error"] });
      break;
  }

  if (!authenticated) {
    res
      .send(statusCodes.UNAUTHENTICATED)
      .json({ errors: ["Incorrect login credentials"] });
  } else {
    // TODO Generate session token
  }
};

// Checks that the session cookie is valid; if not, redirects to the login page
const verifySession = async (req, res, next) => {};

// Destroys the stored session token
const logout = async (req) => {};

// Creates a user - specifically for DB-backed user management.
// Returns an error if user management is AD-backed.
// In a proper environment we'd probably want email verification. TBH we'd want AD auth anyway so it's kinda moot
const register = async (username, password) => {
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

module.exports = {
  authenticate,
  verifySession,
  logout,
  register,
};
