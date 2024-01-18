const User = require("../models/User");
const HashedPassword = require("../models/HashedPassword");
const TokenValidity = require("../models/TokenValidity");
const { log, levels } = require("../../utils/logger");

/**
 * These just provide a little layer of abstraction over the underlying database implementation;
 * we could potentially put this into the `database-manager` file, but that would mean we're putting DB logic
 * in two different dirs, which is a little messy, and could become problematic if we ever supported different DBMSs
 */

/**
 * @typedef {object} User
 * @property {string} name
 * @property {string} hashedPassword
 */

/**
 * @param {string} username
 * @returns
 */
const findUserByName = async (username) => {
  let user = null;

  if (username) {
    user = await User.findOne({ name: username });
  }

  return user;
};

/**
 * If userId is null or undefined, mongoose should handle ensuring that no records are returned.
 * @param {string} userId
 * @returns
 */
const findUserById = async (userId) => {
  let user = null;

  if (userId) {
    user = await User.findById(userId);
  }

  return user;
};

/**
 * @param {User} user
 * @returns
 */
const createUser = async (username, hashedPassword) => {
  log("createUser", `Creating user with name ${username}`, levels.DEBUG);
  const createdUser = await User.create({
    name: username,
  });
  const pw = await HashedPassword.create({
    hashedPassword: hashedPassword,
  });
  createdUser.password = pw._id;
  await createdUser.save();
  return createdUser;
};

/**
 * If userId is null or undefined, mongoose should handle ensuring that no records are returned.
 * @param {string} userId
 * @returns
 */
const deleteUser = async (userId) => {
  log("deleteUser", `Deleting user with ID ${userId}`, levels.INFO);
  const user = await User.findById(userId);
  if (user) {
    await HashedPassword.findByIdAndDelete(user.password);
    await user.deleteOne();
  }
  await TokenValidity.findOneAndDelete({ userId: userId });
};

const getUserAndPasswordByUsername = async (username) => {
  return await User.findOne({ name: username }).populate("password");
};

const getMinTokenTimestamp = async (userId) => {
  let timestamp = 0;
  // If the user does not exist, there will not be an entry for them
  //  (validity entry is deleted when user is deleted)
  const tokenValidity = await TokenValidity.findOne({ userId });
  if (tokenValidity) {
    timestamp = tokenValidity.minTokenValidity;
  }
  return timestamp;
};

module.exports = {
  findUserByName,
  findUserById,
  createUser,
  deleteUser,
  getUserAndPasswordByUsername,
  getMinTokenTimestamp,
};
