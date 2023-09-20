const securityConfig = require("../config/security-config");
const ActiveDirectory = require("activedirectory");

const ad = new ActiveDirectory(securityConfig.adConfig);

// TODO Handle the PKI case (no password; ie. just check that given username exists)
const authenticate = async (username, password) => {
  let success = false;
  ad.authenticate(username, password, (err, auth) => {
    if (auth) {
      success = true;
    }
  });

  return success;
};

module.exports = {
  authenticate,
};
