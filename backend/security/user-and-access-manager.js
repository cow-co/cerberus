// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");

const adminService = require("../db/services/admin-service");
const implantService = require("../db/services/implant-service");
const acgService = require("../db/services/acg-service");
const userService = require("../db/services/user-service");
const validation = require("../validation/security-validation");

const sanitize = require("sanitize");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const sanitizer = sanitize();

const operationType = {
  READ: "READ",
  EDIT: "EDIT",
};

const accessControlType = {
  READ: "READ",
  EDIT: "EDIT",
  ADMIN: "ADMIN",
};

const targetEntityType = {
  IMPLANT: "IMPLANT",
  USER: "USER",
};

/**
 * Checks that the certificate is valid, and grabs the CN from it.
 * @param {import("express").Request} req The HTTP request
 * @returns The CN of the certificate subject
 */
const extractUserDetailsFromCert = (req) => {
  log(
    "extractUserDetails",
    "Extracting user details from client certificate",
    levels.DEBUG
  );
  // TODO When registering, pull these deets from the cert if PKI is enabled (rather than the user setting their own username)
  const clientCert = req.socket.getPeerCertificate();
  let username = null;

  if (req.client.authorized) {
    username = clientCert.subject.CN;
  } else {
    log(
      "extractUserDetails",
      "PKI Certificate Authentication Failed - Cert rejected",
      levels.WARN
    );
  }

  return username;
};

/**
 * Verifies the username/password combination is correct.
 * @param {string} username
 * @param {string} password
 * @returns authenticated {bool}, errors {array{string}}
 */
const checkCreds = async (username, password) => {
  log(
    "user-and-access-manager/checkCreds",
    `Authenticating user ${username}`,
    levels.DEBUG
  );
  let errors = [];
  let authenticated = false;

  if (username) {
    const user = await userService.getUserAndPasswordByUsername(username);
    if (user) {
      if (!securityConfig.usePKI) {
        authenticated = await argon2.verify(
          user.password.hashedPassword,
          password
        );
      } else {
        authenticated = true;
      }
    }
  }

  if (!authenticated) {
    log(
      "user-and-access-manager/authenticate",
      `Incorrect Credentials: username = ${username}`,
      levels.SECURITY
    );
    errors.push("Incorrect Credentials");
  }

  return { authenticated, errors };
};

/**
 * Generates a JWT for the user. Call *after* checking their credentials.
 * @param {string} username
 * @returns Object containing userId, username, isAdmin, and token
 */
const generateJWT = async (username) => {
  log("user-and-access-manager/generateJWT", "generating JWT...", levels.DEBUG);
  let data = {};
  const user = await findUserByName(username);
  if (user.id) {
    data.userId = user.id;
    data.username = user.name;
    data.isAdmin = await adminService.isUserAdmin(user.id);

    const token = jwt.sign(
      {
        userId: data.userId,
        username: data.username,
      },
      securityConfig.jwtSecret,
      { expiresIn: "1h" }
    );

    data.token = token;
  }

  return data;
};

/**
 * Basically checks the provided credentials
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
    username = extractUserDetailsFromCert(req);
  } else {
    username = req.body.username;
    username = sanitizer.value(username, "str");
    password = req.body.password;
    password = sanitizer.value(password, "str");
  }
  let authenticated = false;

  username = username ? username.trim() : "";

  try {
    credsResult = await checkCreds(username, password);
    errors = errors.concat(credsResult.errors);
    authenticated = credsResult.authenticated;

    if (!authenticated) {
      status = statusCodes.UNAUTHENTICATED;
      res.status(status).json({ errors });
    } else {
      const result = await generateJWT(username);
      req.data = result;
      next();
    }
  } catch (err) {
    log("user-and-access-manager/authenticate", err, levels.ERROR);

    errors.push("Internal Server Error");
    status = statusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({ errors });
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

  const authHeader = req.headerString("authorization");

  if (!authHeader && !securityConfig.usePKI) {
    res.status(statusCodes.FORBIDDEN).json({ errors: ["No token"] });
  } else if (!authHeader && securityConfig.usePKI) {
    await authenticate(req, res, next);
  } else {
    const token = authHeader.split(" ")[1];

    try {
      let payload = jwt.verify(token, securityConfig.jwtSecret);
      payload = sanitizer.primitives(payload); // This ensures all the keys are at least only Booleans, Integers, or Strings. Sufficient for our purposes.
      const minTimestamp = await userService.getMinTokenTimestamp(
        payload.userId
      );

      if (minTimestamp < payload.iat * 1000) {
        req.data = {};
        req.data.userId = payload.userId;
        req.data.username = payload.username;

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
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError" ||
        err.name === "NotBeforeError"
      ) {
        log("verifyToken", err, levels.SECURITY);

        res.status(statusCodes.FORBIDDEN).json({ errors: ["Invalid Token"] });
      } else {
        log("verifyToken", err, levels.ERROR);

        res
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .json({ errors: ["Internal Server Error"] });
      }
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
  await userService.generateTokenValidityEntry(userId);
};

/**
 * Creates a user - specifically for DB-backed user management.
 * In a proper environment we'd probably want email verification
 * @param {string} username
 * @param {string} password
 * @returns
 */
const register = async (username, password, confirmPassword) => {
  log(
    "user-and-access-manager/register",
    `Registering user ${username}`,
    levels.DEBUG
  );

  username = username.trim();
  const user = await findUserByName(username);

  let response = {
    userId: null,
    errors: [],
  };

  if (!user.id) {
    let validationErrors = validation.validatePassword(
      password,
      confirmPassword,
      securityConfig.passwordRequirements
    );
    validationErrors = validationErrors.concat(
      validation.validateUsername(username)
    );

    if (validationErrors.length === 0) {
      const hashed = await argon2.hash(password);
      const userRecord = await userService.createUser(username, hashed);
      response.userId = userRecord._id;
    } else {
      log(
        "database-manager/register",
        "Validation of username/password failed",
        levels.WARN
      );
      response.errors = response.errors.concat(validationErrors);
    }
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
 * @param {string} userId
 * @returns
 */
const removeUser = async (userId) => {
  log("removeUser", `Removing user ${userId}`, levels.DEBUG);
  if (userId) {
    await userService.deleteUser(userId);
    await adminService.changeAdminStatus(userId, false);
  }
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
  let user = await userService.findUserByName(username);
  if (!user) {
    user = {
      id: "",
      name: "",
      acgs: [],
    };
  } else {
    // This is only the ID of the hashed password, not the hash itself, but is still sensitive
    delete user.password;
    user.id = user._id;
    delete user._id;
  }
  return user;
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
  let user = await userService.findUserById(userId);
  if (!user) {
    user = {
      id: "",
      name: "",
      acgs: [],
    };
  } else {
    // This is only the ID of the hashed password, not the hash itself, but is still sensitive
    delete user.password;
    user.id = user._id;
    delete user._id;
  }
  return user;
};

/**
 * @param {String} userId
 * @returns group IDs
 */
const getGroupsForUser = async (userId) => {
  let acgs = [];
  const user = await findUserById(userId);
  if (user && user.acgs) {
    acgs = user.acgs;
  }
  return acgs;
};

const editUserGroups = async (groups, id) => {
  const user = await userService.findUserById(id);
  user.acgs = groups;
  await user.save();
};

const getAllGroups = async () => {
  let errors = [];
  let acgs = null;
  acgs = await acgService.getAllACGs();

  if (!acgs) {
    errors = ["Query for all ACGs failed"];
  }

  return {
    errors,
    acgs,
  };
};

const createGroup = async (acgName) => {
  let errors = [];
  const existing = await acgService.findACG(acgName);
  if (!existing) {
    const created = await acgService.createACG(acgName);
    if (!created) {
      errors.push("Could not create ACG!");
    }
  } else {
    errors.push("ACG with that name already exists!");
  }
  return errors;
};

/**
 *
 * @param {string} acgId
 * @returns
 */
const deleteGroup = async (acgId) => {
  let errors = [];
  let deletedEntity = null;
  if (acgId) {
    deletedEntity = await acgService.deleteACG(acgId);
  } else {
    errors.push("Must provide an ID for the ACG");
  }
  return {
    deletedEntity,
    errors,
  };
};

/**
 * @param {Array} implants
 * @param {String} userId
 * @returns
 */
const filterImplantsForView = async (implants, userId) => {
  let filtered = [];
  let errors = [];

  const isAdmin = await adminService.isUserAdmin(userId);

  if (isAdmin) {
    filtered = implants;
  } else {
    const groupsResult = await getGroupsForUser(userId);

    filtered = implants.filter((implant) => {
      const readGroups = implant.readOnlyACGs.concat(implant.operatorACGs);
      if (implant.readOnlyACGs.length === 0) {
        return true;
      } else {
        return (
          readGroups.filter((group) => groupsResult.includes(group)).length > 0
        );
      }
    });
  }

  return {
    filtered,
    errors,
  };
};

/**
 * @param {String} userId Which user is conducting the operation?
 * @param {String} implantId Which implant (implantId, NOT database ID) is being operated on?
 * @param {'READ' | 'EDIT'} operation What sort of operation is being conducted?
 * @returns true if authorised, false otherwise
 */
const isUserAuthorisedForOperationOnImplant = async (
  userId,
  implantId,
  operation
) => {
  let isAuthorised = false;

  const implant = await implantService.findImplantById(implantId);

  if (implant) {
    let acgs = implant.operatorACGs;

    switch (operation) {
      case operationType.READ:
        acgs = acgs.concat(implant.readOnlyACGs);
        break;
      default:
        break;
    }

    if (acgs && acgs.length > 0) {
      const groups = await getGroupsForUser(userId);
      isAuthorised = acgs.filter((group) => groups.includes(group)).length > 0;
    } else {
      // If we are trying to edit, then we check to ensure the readOnlyACGs list is empty;
      // if it *isn't* (ie. read-only list is populated, but operator list is not) then operator is
      // restricted to admins-only. This secures us against mistakes in ACG setup/cases where
      // the read-only list is created before the operator list is populated.
      isAuthorised =
        operation === operationType.READ ||
        (operation === operationType.EDIT && implant.readOnlyACGs.length === 0);
    }
  }

  return isAuthorised;
};

/**
 * Non-admin users can only view/edit themselves
 * @param {String} userId
 * @param {String} targetUserId
 * @returns true if permitted, false otherwise
 */
const isUserAuthorisedForOperationOnUser = async (userId, targetUserId) => {
  return userId === targetUserId;
};

// TODO Neaten up the signature here
const authZCheck = async (
  operation,
  targetEntity,
  targetEntityId,
  accessControl,
  userId
) => {
  let permitted = false;

  const isAdmin = await adminService.isUserAdmin(userId);

  if (isAdmin) {
    permitted = true;
  } else if (accessControl !== accessControlType.ADMIN) {
    switch (targetEntity) {
      case targetEntityType.IMPLANT:
        permitted = await isUserAuthorisedForOperationOnImplant(
          userId,
          targetEntityId,
          operation
        );
        break;
      case targetEntityType.USER:
        permitted = await isUserAuthorisedForOperationOnUser(
          userId,
          targetEntityId
        );
        break;
      default:
        break;
    }
  }
  return permitted;
};

module.exports = {
  operationType,
  targetEntityType,
  accessControlType,
  authenticate,
  verifyToken,
  logout,
  register,
  removeUser,
  findUserByName,
  findUserById,
  filterImplantsForView,
  getGroupsForUser,
  editUserGroups,
  getAllGroups,
  createGroup,
  deleteGroup,
  authZCheck,
};
