// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const dbUserManager = require("./database-manager");
const adUserManager = require("./active-directory-manager");
const pki = require("./pki");
const adminService = require("../db/services/admin-service");
const jwt = require("jsonwebtoken");
const userService = require("../db/services/user-service");

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
        authenticated = await dbUserManager.authenticate(
          username,
          password,
          securityConfig.usePKI
        );
        break;
      case securityConfig.availableAuthMethods.AD:
        authenticated = await adUserManager.authenticate(
          username,
          password,
          securityConfig.usePKI
        );
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
    req.data = {};
    req.data.username = username;
    req.data.token = token;
    const result = await findUserByName(username);
    req.data.userId = result.user.id;
    req.data.isAdmin = await adminService.isUserAdmin(result.user.id);

    const token = jwt.sign(
      {
        userId: req.data.userId,
      },
      securityConfig.jwtSecret,
      { expiresIn: "1h" }
    );
    next();
  }
};

/**
 * Checks that the JWT is valid; if not, redirects to the login page
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const verifyToken = async (req, res, next) => {
  log("verifyToken", "Verifying Token...", levels.DEBUG);
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, securityConfig.jwtSecret);
    console.log(payload);
    const minTimestamp = await userService.getMinTokenTimestamp(payload.userId);

    if (minTimestamp < payload.iat) {
      req.data.userId = payload.userId;
      next();
    } else {
      // We attempt to login automatically if PKI is enabled, since we don't need the user
      // to manually submit anything
      if (securityConfig.usePKI) {
        await authenticate(req, res, next);
      } else {
        res.status(statusCodes.FORBIDDEN).json({ errors: ["Invalid token"] });
      }
    }
  } catch (err) {
    res.status(statusCodes.FORBIDDEN).json({ errors: ["Invalid token"] });
  }
};

/**
 * Invalidates the JWTs issued to the user
 * @param {string} userId
 */
const logout = async (userId) => {
  switch (securityConfig.authMethod) {
    case securityConfig.availableAuthMethods.DB:
      await dbUserManager.logout(userId);
      break;
    case securityConfig.availableAuthMethods.AD:
      await adUserManager.logout(userId); // Actually is the user ID
      break;
    default:
      break;
  }
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

  const { user } = await findUserByName(username);
  if (
    !user &&
    securityConfig.authMethod === securityConfig.availableAuthMethods.DB
  ) {
    const createdUser = await dbUserManager.register(
      username,
      password,
      securityConfig.passwordRequirements
    );
    response._id = createdUser.userId;
    response.errors = createdUser.errors;
  } else if (!user) {
    response.errors.push(
      "Registering is not supported for the configured auth method; please ask your administrator to add you."
    );
  } else {
    response.errors.push("A user already exists with that name");
  }

  return response;
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const checkAdmin = async (req, res, next) => {
  const userId = req.data.userId;
  let isAdmin = false;

  // This ensures we call this method after logging in
  if (userId) {
    isAdmin = await adminService.isUserAdmin(userId);
    if (isAdmin) {
      next();
    } else {
      log("checkAdmin", "User is not an admin", levels.WARN);
      res
        .status(statusCodes.FORBIDDEN)
        .json({ errors: ["You must be an admin to do this"] });
    }
  } else {
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
        break;
      case securityConfig.availableAuthMethods.AD:
        log(
          "removeUser",
          "Cannot remove a user when backed by Active Directory. Contact domain admin to remove user.",
          levels.WARN
        );
        adUserManager.deleteUser(userId);
        errors.push(
          "You cannot entirely remove users provided by Active Directory, but the user has been removed as admin."
        );
        break;

      default:
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
      case securityConfig.availableAuthMethods.AD:
        user = await adUserManager.findUserByName(userName);
        break;

      default:
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
      case securityConfig.availableAuthMethods.AD:
        user = await adUserManager.findUserById(userId);
        break;

      default:
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
  verifyToken,
  logout,
  register,
  checkAdmin,
  removeUser,
  findUserByName,
  findUserById,
};
