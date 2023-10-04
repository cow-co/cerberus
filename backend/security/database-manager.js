const userService = require("../db/services/user-service");
const argon2 = require("argon2");
const securityConfig = require("../config/security-config");
const { levels, log } = require("../utils/logger");
const { validatePassword } = require("../validation/security-validation");
const User = require("../db/models/User");

const register = async (username, password) => {
  let response = {
    userId: "",
    errors: [],
  };

  try {
    const validationErrors = validatePassword(password);

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
        "Validation of password failed",
        levels.WARN
      );
      response.errors = response.errors.concat(validationErrors);
    }
  } catch (err) {
    log("database-manager#register", "OH NO", levels.ERROR);
    response.errors.push("Internal Server Error");
  }
  return response;
};

// Password should be null if using PKI (since PKI login doesn't use a password)
const authenticate = async (username, password) => {
  log("database-manager#authenticate", "DB Authentication...", levels.DEBUG);
  let user = null;
  let authenticated = false;

  if (username !== null) {
    user = await userService.findUser(username);
    if (user !== null) {
      log("database-manager#authenticate", JSON.stringify(user), levels.DEBUG);
      if (!securityConfig.usePKI) {
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

// TODO We should put in something to remove the user as an admin (unless maybe we wanna put that in the outer access-manager area?)
const deleteUser = async (userId) => {
  return userService.deleteUser(userId);
};

const findUserById = async (userId) => {
  const user = await userService.findUserById(userId);
  return user;
};

const findUserByName = async (username) => {
  const user = await userService.findUser(username);
  return user;
};

module.exports = {
  register,
  authenticate,
  deleteUser,
  findUserById,
  findUserByName,
};
