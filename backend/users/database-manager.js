const { findUser, createUser } = require("../db/services/user-service");
const argon2 = require("argon2");
const securityConfig = require("../config/security-config");
const { levels, log } = require("../utils/logger");

const register = async (username, password) => {
  const hashed = await argon2.hash(password);
  return await createUser({ name: username, hashedPassword: hashed, acgs: [] });
};

// Password should be null if using PKI (since PKI login doesn't use a password)
const authenticate = async (username, password) => {
  let user = null;
  let authenticated = false;

  if (username !== null) {
    user = await findUser(username);
    if (!securityConfig.usePKI) {
      authenticated = await argon2.verify(user.hashedPassword, password);
    } else {
      authenticated = true;
    }
  } else {
    log("db-user-manager#authenticate", "Username not provided", levels.WARN);
  }

  return authenticated;
};

module.exports = {
  register,
  authenticate,
};
