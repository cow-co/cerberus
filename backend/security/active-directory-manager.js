const securityConfig = require("../config/security-config");
const ActiveDirectory = require("activedirectory");
const userService = require("../db/services/user-service");
const adminService = require("../db/services/admin-service");
const TokenValidity = require("../db/models/TokenValidity");
const { levels, log } = require("../utils/logger");

const ad = new ActiveDirectory(securityConfig.adConfig);

/**
 * @param {string} username
 * @param {string} password Will be null if using PKI for authentication
 * @returns true if authenticated, false otherwise
 */
const authenticate = async (username, password, usePKI) => {
  log(
    "active-directory-manager/authenticate",
    `Authenticating user ${username}`,
    levels.DEBUG
  );
  let success = false;
  if (usePKI) {
    ad.userExists(username, (err, exists) => {
      success = exists;
    });
  } else {
    ad.authenticate(username, password, (err, auth) => {
      if (auth) {
        success = true;
      }
    });
  }

  return success;
};

/**
 * @param {string} userId
 * @returns
 */
const findUserById = async (userId) => {
  return await findUserByName(userId);
};

/**
 * @param {string} username
 * @returns id and name of user (both empty if user not found)
 */
const findUserByName = async (username) => {
  log(
    "active-directory-manager/findUserByName",
    `Finding user ${username}`,
    levels.DEBUG
  );
  let foundUser = null;
  ad.findUser(username, (err, user) => {
    foundUser = user;
  });

  if (foundUser !== null) {
    return {
      id: foundUser.userPrincipalName,
      name: foundUser.sAMAccountName,
    };
  } else {
    return {
      id: "",
      name: "",
    };
  }
};

const deleteUser = async (userId) => {
  log(
    "active-directory-manager/deleteUser",
    `Deleting user ${userId}`,
    levels.DEBUG
  );
  await userService.deleteUser(userId);
  await adminService.changeAdminStatus(userId, false);
};

const logout = async (userId) => {
  log(
    "active-directory-manager/logout",
    `Logging user ${userId} out`,
    levels.DEBUG
  );
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

const getGroupsForUser = (userId) => {
  let groups = [];
  ad.getGroupMembershipForUser(userId, (err, adGroups) => {
    if (!err) {
      groups = adGroups;
    } else {
      log("active-directory-manager/getGroupsForUser", err, levels.WARN);
    }
  });
  return groups;
};

const getAllGroups = () => {
  let groups = null;
  ad.findGroups((err, adGroups) => {
    if (!err) {
      groups = adGroups;
    } else {
      log("active-directory-manager/getAllGroups", err, levels.WARN);
    }
  });
  return groups;
}

module.exports = {
  authenticate,
  findUserById,
  findUserByName,
  deleteUser,
  logout,
  getGroupsForUser,
  getAllGroups,
};
