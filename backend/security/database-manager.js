const userService = require("../db/services/user-service");
const adminService = require("../db/services/admin-service");
const acgService = require("../db/services/acg-service");
const { levels, log } = require("../utils/logger");
const {
  validatePassword,
  validateUsername,
} = require("../validation/security-validation");
const TokenValidity = require("../db/models/TokenValidity");
const argon2 = require("argon2");

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
  if (userId) {
    await userService.deleteUser(userId);
    await adminService.changeAdminStatus(userId, false);
  }
};

/**
 * @param {string} userId
 * @returns null, if the user is not found
 */
const findUserById = async (userId) => {
  log("database-manager/findUserById", `Finding user ${userId}`, levels.DEBUG);
  const user = await userService.findUserById(userId);
  if (!user) {
    return {
      id: "",
      name: "",
      acgs: [],
    };
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
 * @returns The user object, with ID, name, and ACG list. These are all *empty* if the user does not exist.
 */
const findUserByName = async (username) => {
  log(
    "database-manager/findUserByName",
    `Finding user ${username}`,
    levels.DEBUG
  );
  const user = await userService.findUserByName(username);
  if (!user) {
    return {
      id: "",
      name: "",
      acgs: [],
    };
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

const getGroupsForUser = async (userId) => {
  let acgs = [];
  const user = await findUserById(userId);
  if (user && user.acgs) {
    acgs = user.acgs;
  }
  return acgs;
};

const getAllGroups = async () => {
  const acgs = await acgService.getAllACGs();
  return acgs;
};

const createGroup = async (name) => {
  await acgService.createACG(name);
};

const deleteGroup = async (id) => {
  return await acgService.deleteACG(id);
};

module.exports = {
  register,
  logout,
  deleteUser,
  findUserById,
  findUserByName,
  isUserInGroup,
  getGroupsForUser,
  getAllGroups,
  createGroup,
  deleteGroup,
};
