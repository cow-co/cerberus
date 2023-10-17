// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const dbUserManager = require("./database-manager");
const adUserManager = require("./active-directory-manager");
const pki = require("./pki");
const adminService = require("../db/services/admin-service");

/**
 * Basically checks the provided credentials
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const authenticate = async (req, res, next) => {
  log("access-manager#authenticate", "Authenticating...", levels.DEBUG);
  let username = null;
  let password = null;
  let errors = [];
  let status = statusCodes.BAD_REQUEST;

  if (securityConfig.usePKI) {
    // TODO Test
    username = pki.extractUserDetails(req);
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
    // TODO Test
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

/**
 * Checks that the session cookie is valid; if not, redirects to the login page
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const verifySession = async (req, res, next) => {
  // TODO Test this method ideally (maybe just as a unit test, not as an end-to-end request test)
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

/**
 * Destroys the stored session token
 * @param {Session} session
 */
const logout = async (session) => {
  session.destroy();
};

/**
 * Creates a user - specifically for DB-backed user management.
 * In a proper environment we'd probably want email verification. TBH we'd want AD auth anyway so it's kinda moot
 * @param {string} username
 * @param {string} password
 * @returns An error if user management is backed by an external system (eg. AD).
 */
const register = async (username, password) => {
  username = username.trim();
  let response = {
    _id: null,
    errors: [],
  };

  if (securityConfig.authMethod === securityConfig.availableAuthMethods.AD) {
    response.errors.push(
      "Registering is not supported for AD-backed auth; please ask your Active Directory administrator to add you."
    );
  } else {
    const createdUser = await dbUserManager.register(username, password);
    response._id = createdUser.userId;
    response.errors = createdUser.errors;
  }

  return response;
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const checkAdmin = async (req, res, next) => {
  const username = req.session.username;
  let isAdmin = false;

  // This ensures we call this method after logging in
  if (username) {
    const result = await findUserByName(username);
    if (result.errors.length > 0) {
      res.status(statusCodes.FORBIDDEN).json({ errors });
    } else {
      isAdmin = await adminService.isUserAdmin(result.user.id);
      if (isAdmin) {
        next();
      } else {
        log("checkAdmin", "User is not an admin", levels.WARN);
        res
          .status(statusCodes.FORBIDDEN)
          .json({ errors: ["You must be an admin to do this"] });
      }
    }
  } else {
    // TODO TEST
    log("checkAdmin", "User is not logged in", levels.WARN);
    res
      .status(statusCodes.FORBIDDEN)
      .json({ errors: ["You must be logged in to do this"] });
  }
};

/**
 * @param {string} userId
 * @returns
 */
const removeUser = async (userId) => {
  let errors = [];
  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        await dbUserManager.deleteUser(userId);
        await adminService.removeAdmin(userId);
        break;
      // TODO Test this code path
      case securityConfig.availableAuthMethods.AD:
        log(
          "removeUser",
          "Cannot remove a user when backed by Active Directory. Contact domain admin to remove user.",
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;

      default:
        // TODO TEST
        log(
          "removeUser",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;
    }
  } catch (err) {
    log("removeUser", err, levels.ERROR);
    errors.push("Internal Server Error");
  }

  return errors;
};

/**
 * @param {string} userName
 * @returns
 */
const findUserByName = async (userName) => {
  let errors = [];
  let user = null;
  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        user = await dbUserManager.findUserByName(userName);
        break;
      // TODO Test this code path
      case securityConfig.availableAuthMethods.AD:
        user = await adUserManager.findUserByName(userName);
        break;

      default:
        // TODO TEST
        log(
          "findUserByName",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;
    }
  } catch (err) {
    log("findUserByName", err, levels.ERROR);
    errors.push("Internal Server Error");
  }

  return {
    user,
    errors,
  };
};

/**
 * @param {string} userId
 * @returns
 */
const findUserById = async (userId) => {
  let errors = [];
  let user = null;
  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        user = await dbUserManager.findUserById(userId);
        break;
      // TODO Test this code path
      case securityConfig.availableAuthMethods.AD:
        user = await adUserManager.findUserById(userId);
        break;

      default:
        // TODO TEST
        log(
          "findUserById",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;
    }
  } catch (err) {
    log("findUserById", err, levels.ERROR);
    errors.push("Internal Server Error");
  }

  return {
    user,
    errors,
  };
};

module.exports = {
  authenticate,
  verifySession,
  logout,
  register,
  checkAdmin,
  removeUser,
  findUserByName,
  findUserById,
};
