// This is an abstraction over the top of configurable user manager types
// Downstream code calls this, and this delegates to the configured user manager
const securityConfig = require("../config/security-config");
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const dbUserManager = require("./database-manager");
const adUserManager = require("./active-directory-manager");
const pki = require("./pki");
const adminService = require("../db/services/admin-service");
const implantService = require("../db/services/implant-service");
const jwt = require("jsonwebtoken");
const userService = require("../db/services/user-service");
const sanitize = require("sanitize");

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
 * Basically checks the provided credentials
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {function} next
 */
// TODO We must ensure that the existing token is removed, if it exists!
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
    username = sanitizer.value(username, "str");
    password = req.body.password;
    password = sanitizer.value(password, "str");
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

  // TODO Possibly split this block and the section above into separate functions, called from authenticate()
  if (!authenticated && errors.length === 0) {
    log(
      "user-and-access-manager/authenticate",
      `User ${username} failed login due to incorrect credentials`,
      levels.SECURITY
    );

    status = statusCodes.UNAUTHENTICATED;
    errors.push("Incorrect login credentials");

    res.status(status).json({ errors });
  } else if (errors.length > 0) {
    log(
      "user-and-access-manager/authenticate",
      `User ${username} failed login due to miscellaneous errors: ${JSON.stringify(
        errors
      )}`,
      levels.SECURITY
    );

    res.status(status).json({ errors });
  } else {
    req.data = {};
    // TODO Perhaps call this at the top of the function, and kick out early if user does not exist
    //  Perhaps the user details should be returned from the AD/DB auth functions, since those will need to check user-existence at least, anyway.
    const result = await findUserByName(username);
    if (result.errors.length > 0) {
      res.status(status).json({ errors });
    } else {
      req.data.userId = result.user.id;
      req.data.username = username;
      req.data.isAdmin = await adminService.isUserAdmin(result.user.id);

      const token = jwt.sign(
        {
          userId: req.data.userId,
          username: req.data.username, // TODO Are these (name and isAdmin) ever actually used from the token? isAdmin shouldn't be!
          isAdmin: req.data.isAdmin,
          iat: Date.now(), // Default IAT is in seconds, which not match with the timestamps we use elsewhere
        },
        securityConfig.jwtSecret,
        { expiresIn: "1h" }
      );

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

      if (minTimestamp < payload.iat) {
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
  switch (securityConfig.authMethod) {
    case securityConfig.availableAuthMethods.DB:
      await dbUserManager.logout(userId);
      break;
    case securityConfig.availableAuthMethods.AD:
      await adUserManager.logout(userId); // Actually is the user ID
      break;
    // TODO fill this out (throw an exception, or maybe delegate to the db manager as a default?)
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
  const { user } = await findUserByName(username);

  let response = {
    _id: null,
    errors: [],
  };

  if (
    !user.id &&
    securityConfig.authMethod === securityConfig.availableAuthMethods.DB
  ) {
    const createdUser = await dbUserManager.register(
      username,
      password,
      securityConfig.passwordRequirements
    );
    response._id = createdUser.userId;
    response.errors = createdUser.errors;
  } else if (!user.id) {
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
 * @param {string} userId
 * @returns
 */
const removeUser = async (userId) => {
  log("removeUser", `Removing user ${userId}`, levels.DEBUG);

  let errors = [];

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
  let user = { id: "", name: "" };

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
  let user = {
    id: "",
    name: "",
  };

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

  return {
    user,
    errors,
  };
};

/**
 * @param {String} userId ID (either database ID, or UPN for active directory) of user
 * @returns Object: {errors, groups}
 */
const getGroupsForUser = async (userId) => {
  let errors = [];
  let groups = [];

  switch (securityConfig.authMethod) {
    case securityConfig.availableAuthMethods.DB:
      groups = await dbUserManager.getGroupsForUser(userId);
      break;
    case securityConfig.availableAuthMethods.AD:
      groups = await adUserManager.getGroupsForUser(userId);
      break;

    // TODO Perhaps make this into an exception instead (something like BadConfigError) and throw instead of returning error array
    //  That will make things more consistent in terms of server errors being raised as exceptions and user errors being returned in error arrays
    //  Or perhaps simply remove these checks (at least, remove them as returned errors), and do the check at boot-time (some kinda config-validation function)
    //  and from then on, can reasonably safely assume we're good - node caches the module so runtime updates to the config files won't take effect
    default:
      log(
        "user-and-access-manager/getGroupsForUser",
        `Auth method ${securityConfig.authMethod} not supported`,
        levels.ERROR
      );

      errors.push("Internal Server Error");
      break;
  }

  return {
    groups,
    errors,
  };
};

const getAllGroups = async () => {
  let errors = [];
  let groups = [];
  let acgs = null;

  switch (securityConfig.authMethod) {
    case securityConfig.availableAuthMethods.DB:
      acgs = await dbUserManager.getAllGroups();
      break;
    case securityConfig.availableAuthMethods.AD:
      acgs = adUserManager.getAllGroups();
      break;
    default:
      log(
        "user-and-access-manager/getAllGroups",
        `Auth method ${securityConfig.authMethod} not supported`,
        levels.ERROR
      );

      errors.push("Internal Server Error");
      break;
  }

  if (acgs) {
    groups = acgs;
  } else {
    errors = ["Query for all ACGs failed"];
  }

  return {
    errors,
    groups,
  };
};

const createGroup = async (acgName) => {
  // TODO return an error if acg with that name already exists

  let errors = [];
  if (acgName) {
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        await dbUserManager.createGroup(acgName);
        break;
      case securityConfig.availableAuthMethods.AD:
        log(
          "user-and-access-manager/createGroup",
          `Auth method ${securityConfig.authMethod} does not support creation of groups`,
          levels.ERROR
        );

        errors.push(
          "Cannot create a group via CERBERUS - please contact your system administrator."
        );
        break;
      default:
        log(
          "user-and-access-manager/createGroup",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );

        errors.push("Internal Server Error");
        break;
    }
  } else {
    errors.push("Must provide a name for the ACG");
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
    switch (securityConfig.authMethod) {
      case securityConfig.availableAuthMethods.DB:
        deletedEntity = await dbUserManager.deleteGroup(acgId);
        break;
      case securityConfig.availableAuthMethods.AD:
        log(
          "user-and-access-manager/deleteGroup",
          `Auth method ${securityConfig.authMethod} does not support deletion of groups`,
          levels.ERROR
        );

        errors.push(
          "Cannot delete a group via CERBERUS - please contact your system administrator."
        );
        break;
      default:
        log(
          "user-and-access-manager/deleteGroup",
          `Auth method ${securityConfig.authMethod} not supported`,
          levels.ERROR
        );

        errors.push("Internal Server Error");
        break;
    }
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

    // TODO Perhaps don't return an errors array - if errors occur simply log it, return an empty groups
    //  Only issue is that this will make errors invisible to users - who may be confused if they are seeing fewer implants than they expect
    // TODO think about the exception vs error design we should go for
    if (groupsResult.errors.length === 0) {
      filtered = implants.filter((implant) => {
        const readGroups = implant.readOnlyACGs.concat(implant.operatorACGs);
        if (implant.readOnlyACGs.length === 0) {
          return true;
        } else {
          return (
            readGroups.filter((group) => groupsResult.groups.includes(group))
              .length > 0
          );
        }
      });
    } else {
      errors = groupsResult.errors;
    }
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
      const { groups, errors } = await getGroupsForUser(userId);
      if (errors.length === 0) {
        isAuthorised =
          acgs.filter((group) => groups.includes(group)).length > 0;
      }
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
  getAllGroups,
  createGroup,
  deleteGroup,
  authZCheck,
};
