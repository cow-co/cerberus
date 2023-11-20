const userService = require("../db/services/user-service");
const adminService = require("../db/services/admin-service");
const argon2 = require("argon2");
const { levels, log } = require("../utils/logger");
const {
  validatePassword,
  validateUsername,
} = require("../validation/security-validation");
const TokenValidity = require("../db/models/TokenValidity");

/**
 * @param {string} username
 * @param {string} password
 * @param {object} pwReqs password requirements
 * @returns User ID and any errors
 */
const register = async (username, password, pwReqs) => {
  log("database-manager/register", "Validating password", levels.DEBUG);
  let response = {
    userId: "",
    errors: [],
  };

  try {
    let validationErrors = validatePassword(password, pwReqs);
    validationErrors = validationErrors.concat(validateUsername(username));

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
  } catch (err) {
    log("database-manager/register", err, levels.ERROR);
    response.errors.push("Internal Server Error");
  }
  return response;
};

/**
 * @param {string} username
 * @param {string} password Should be null if using PKI (since PKI login doesn't use a password)
 * @returns
 */
const authenticate = async (username, password, usePKI) => {
  log(
    "database-manager/authenticate",
    `Authenticating user ${username}`,
    levels.DEBUG
  );
  let user = null;
  let authenticated = false;

  if (username) {
    user = await userService.getUserAndPasswordByUsername(username);
    if (user) {
      if (!usePKI) {
        authenticated = await argon2.verify(
          user.password.hashedPassword,
          password
        );
      } else {
        authenticated = true;
      }
    } else {
      log("database-manager/authenticate", "User does not exist", levels.WARN);
    }
  } else {
    log("database-manager/authenticate", "Username not provided", levels.WARN);
  }

  return authenticated;
};

const logout = async (userId) => {
  log("database-manager/logout", `Logging out user ${userId}`, levels.DEBUG);
  const existing = await TokenValidity.findOne({ userId: userId });
  if (existing) {
    existing.minTokenValidity = Date.now();
    await existing.save();
  } else {
    await TokenValidity.create({
      userId: userId,
      minTokenValidity: Date.now(),
    });
  }
};

/**
 * @param {string} userId
 * @returns
 */
const deleteUser = async (userId) => {
  log("database-manager/deleteUser", `Deleting user ${userId}`, levels.DEBUG);
  await userService.deleteUser(userId);
  await adminService.removeAdmin(userId);
};

/**
 * @param {string} userId
 * @returns null, if the user is not found
 */
const findUserById = async (userId) => {
  log("database-manager/findUserById", `Fidning user ${userId}`, levels.DEBUG);
  const user = await userService.findUserById(userId);
  if (!user) {
    return null;
  } else {
    return {
      id: user._id,
      name: user.name,
      acgs: user.acgs,
    };
  }
};

/**
 * @param {string} username
 * @returns null, if the user is not found
 */
const findUserByName = async (username) => {
  log(
    "database-manager/findUserByName",
    `Finding user ${username}`,
    levels.DEBUG
  );
  const user = await userService.findUserByName(username);
  if (!user) {
    return null;
  } else {
    return {
      id: user._id,
      name: user.name,
      acgs: user.acgs,
    };
  }
};

const isUserInGroup = async (userId, acgId) => {
  let isInGroup = false;
  const user = await findUserById(userId);
  if (user) {
    isInGroup = user.acgs.find((id) => id === acgId) !== undefined;
  }
  return isInGroup;
};

module.exports = {
  register,
  authenticate,
  logout,
  deleteUser,
  findUserById,
  findUserByName,
  isUserInGroup,
};
