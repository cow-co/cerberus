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
 * TODO Should probably neaten this up
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
const authenticate = async (req, res, next) => {
  log(
    "user-and-access-manager/authenticate",
    "Authenticating...",
    levels.DEBUG
  );
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
          "user-and-access-manager/authenticate",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        status = statusCodes.INTERNAL_SERVER_ERROR;
        break;
    }
  } catch (err) {
    log("user-and-access-manager/authenticate", err, levels.ERROR);
    errors.push("Internal Server Error");
    status = statusCodes.INTERNAL_SERVER_ERROR;
  }

  if (!authenticated && errors.length === 0) {
    log(
      "user-and-access-manager/authenticate",
      `User ${req.body.username} failed login due to incorrect credentials`,
      levels.SECURITY
    );
    status = statusCodes.UNAUTHENTICATED;
    errors.push("Incorrect login credentials");
    res.status(status).json({ errors });
  } else if (errors.length > 0) {
    log(
      "user-and-access-manager/authenticate",
      `User ${
        req.body.username
      } failed login due to miscellaneous errors: ${JSON.stringify(errors)}`,
      levels.SECURITY
    );
    res.status(status).json({ errors });
  } else {
    req.data = {};
    const result = await findUserByName(username);
    if (result.errors.length > 0) {
      res.status(status).json({ errors });
    } else {
      req.data.isAdmin = await adminService.isUserAdmin(result.user.id);

      const token = jwt.sign(
        {
          userId: result.user.id,
          iat: Date.now(), // Default IAT is in seconds, which not match with the timestamps we use elsewhere
        },
        securityConfig.jwtSecret,
        { expiresIn: "1h" }
      );

      req.data.userId = result.user.id;
      req.data.username = username;
      req.data.token = token;

      next();
    }
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

  if (!req.headers.authorization && !securityConfig.usePKI) {
    res.status(statusCodes.FORBIDDEN).json({ errors: ["No token"] });
  } else if (!req.headers.authorization && securityConfig.usePKI) {
    await authenticate(req, res, next);
  } else {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    try {
      const payload = jwt.verify(token, securityConfig.jwtSecret); // TODO Sanitise payload (not a critical priority since db requests already sanitised)
      const minTimestamp = await userService.getMinTokenTimestamp(
        payload.userId
      );

      if (minTimestamp < payload.iat) {
        req.data = {};
        req.data.userId = payload.userId;
        next();
      } else {
        log(
          "verifyToken",
          "User provided an invalid token. Potential token stealing/token re-use attack!",
          levels.SECURITY
        );
        res.status(statusCodes.FORBIDDEN).json({ errors: ["Invalid token"] });
      }
    } catch (err) {
      // This is logged at the SECURITY level, since a JWT verification failure will go down this path
      log("verifyToken", err, levels.SECURITY);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ errors: ["Internal Server Error"] });
    }
  }
};

/**
 * Invalidates the JWTs issued to the user
 * @param {string} userId
 */
const logout = async (userId) => {
  log(
    "user-and-access-manager/logout",
    `Logging out user ${userId}`,
    levels.DEBUG
  );
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
  log(
    "user-and-access-manager/register",
    `Registering user ${username}`,
    levels.DEBUG
  );
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
    log(
      "user-and-access-manager/register",
      `Cannot register users from CERBERUS when using the ${securityConfig.authMethod} auth method`,
      levels.WARN
    );
    response.errors.push(
      "Registering is not supported for the configured auth method; please ask your administrator to add you."
    );
  } else {
    log(
      "user-and-access-manager/register",
      "A user already exists with that name",
      levels.WARN
    );
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
  log("checkAdmin", "Checking if user is admin", levels.DEBUG);
  const userId = req.data.userId;
  let isAdmin = false;

  // This ensures we call this method after logging in
  if (userId) {
    isAdmin = await adminService.isUserAdmin(userId);
    if (isAdmin) {
      next();
    } else {
      log("checkAdmin", `User ${userId} is not an admin`, levels.SECURITY);
      res
        .status(statusCodes.FORBIDDEN)
        .json({ errors: ["You must be an admin to do this"] });
    }
  } else {
    log("checkAdmin", "User is not logged in", levels.SECURITY);
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
  log("removeUser", `Removing user ${userId}`, levels.DEBUG);
  let errors = [];
  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        await dbUserManager.deleteUser(userId);
        break;
      case securityConfig.availableAuthMethods.AD:
        log(
          "removeUser",
          "Cannot remove a user when backed by Active Directory. However, the user will be removed from the admins list, if they are on it.",
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
 * @param {string} username
 * @returns
 */
const findUserByName = async (username) => {
  log(
    "user-and-access-manager/findUserByName",
    `Finding user ${username}`,
    levels.DEBUG
  );
  let errors = [];
  let user = null;
  try {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        user = await dbUserManager.findUserByName(username);
        break;
      case securityConfig.availableAuthMethods.AD:
        user = await adUserManager.findUserByName(username);
        break;

      default:
        log(
          "user-and-access-manager/findUserByName",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;
    }
  } catch (err) {
    log("user-and-access-manager/findUserByName", err, levels.ERROR);
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
  log(
    "user-and-access-manager/findUserById",
    `Finding user ${userId}`,
    levels.DEBUG
  );
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
          "user-and-access-manager/findUserById",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );
        errors.push("Internal Server Error");
        break;
    }
  } catch (err) {
    log("user-and-access-manager/findUserById", err, levels.ERROR);
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
