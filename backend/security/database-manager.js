const userService = require("../db/services/user-service");
const argon2 = require("argon2");
const securityConfig = require("../config/security-config");
const { levels, log } = require("../utils/logger");
const { validatePassword } = require("../validation/security-validation");

/**
 * @param {string} username
 * @param {string} password
 * @param {object} pwReqs password requirements
 * @returns User ID and any errors
 */
const register = async (username, password, pwReqs) => {
  let response = {
    userId: "",
    errors: [],
  };

  try {
    const validationErrors = validatePassword(password, pwReqs);

    if (validationErrors.length === 0) {
      const hashed = await argon2.hash(password);
      const userRecord = await userService.createUser({
        name: username,
        hashedPassword: hashed,
      });
      response.userId = userRecord._id;
    } else {
      log(
        "database-manager#register",
        "Validation of password failed: " + validationErrors,
        levels.WARN
      );
      response.errors = response.errors.concat(validationErrors);
    }
  } catch (err) {
    log("database-manager#register", err, levels.ERROR);
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
  log("database-manager#authenticate", "DB Authentication...", levels.DEBUG);
  let user = null;
  let authenticated = false;

  if (username !== null) {
    user = await userService.findUser(username);
    if (user !== null) {
      log("database-manager#authenticate", JSON.stringify(user), levels.DEBUG);
      if (!usePKI) {
        authenticated = await argon2.verify(user.hashedPassword, password);
      } else {
        authenticated = true;
      }
    } else {
      log("db-user-manager#authenticate", "User does not exist", levels.WARN);
    }
  } else {
    log("db-user-manager#authenticate", "Username not provided", levels.WARN);
  }

  return authenticated;
};

/**
 * @param {string} userId
 * @returns
 */
const deleteUser = async (userId) => {
  return userService.deleteUser(userId);
};

/**
 * @param {string} userId
 * @returns null, if the user is not found
 */
const findUserById = async (userId) => {
  const user = await userService.findUserById(userId);
  if (!user) {
    return null;
  } else {
    return {
      id: user._id,
      name: user.name,
    };
  }
};

/**
 * @param {string} username
 * @returns null, if the user is not found
 */
const findUserByName = async (username) => {
  const user = await userService.findUser(username);
  if (!user) {
    return null;
  } else {
    return {
      id: user._id,
      name: user.name,
    };
  }
};

module.exports = {
  register,
  authenticate,
  deleteUser,
  findUserById,
  findUserByName,
};
