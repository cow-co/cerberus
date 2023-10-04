const {
  findUser,
  createUser,
  findUserById,
} = require("../db/services/user-service");
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
      const userRecord = await createUser({
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
    user = await findUser(username);
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

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
};

module.exports = {
  register,
  authenticate,
  deleteUser,
};
