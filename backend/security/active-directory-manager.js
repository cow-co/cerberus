const securityConfig = require("../config/security-config");
const ActiveDirectory = require("activedirectory");

const ad = new ActiveDirectory(securityConfig.adConfig);

/**
 * @param {string} username
 * @param {string} password Will be null if using PKI for authentication
 * @returns true if authenticated, false otherwise
 */
const authenticate = async (username, password) => {
  let success = false;
  if (securityConfig.usePKI) {
    // TODO Test this, ideally
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
  // TODO Test this, ideally
  ad.findUser(username, (err, user) => {
    foundUser = user;
  });
  return {
    id: foundUser.sn,
    name: foundUser.sAMAccountName,
  };
};

module.exports = {
  authenticate,
  findUserById,
  findUserByName,
};
