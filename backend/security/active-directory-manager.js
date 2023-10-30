const securityConfig = require("../config/security-config");
const ActiveDirectory = require("activedirectory");

const ad = new ActiveDirectory(securityConfig.adConfig);

/**
 * @param {string} username
 * @param {string} password Will be null if using PKI for authentication
 * @returns true if authenticated, false otherwise
 */
// TODO Also pass in the config (easier testing, and allows flexibility if I ever reused this in diff scenarios)
const authenticate = async (username, password, usePKI) => {
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
  return findUserByName(userId);
};

/**
 * @param {string} username
 * @returns
 */
const findUserByName = async (username) => {
  let foundUser = null;
  ad.findUser(username, (err, user) => {
    foundUser = user;
  });

  if (foundUser !== null) {
    return {
      id: foundUser.sn,
      name: foundUser.sAMAccountName,
    };
  } else {
    return null;
  }
};

module.exports = {
  authenticate,
  findUserById,
  findUserByName,
};
