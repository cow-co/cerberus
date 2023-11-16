const User = require("../models/User");
const HashedPassword = require("../models/HashedPassword");
const TokenValidity = require("../models/TokenValidity");

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
  const createdUser = await User.create({
    name: username,
  });
  await HashedPassword.create({
    hashedPassword: hashedPassword,
  });
  return createdUser;
};

/**
 * If userId is null or undefined, mongoose should handle ensuring that no records are returned.
 * @param {string} userId
 * @returns
 */
const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  // HashedPassword collection only populated when DB auth
  if (user) {
    await HashedPassword.findByIdAndDelete(user.password);
    await user.deleteOne();
  }
  // Token validity is set for all auth types
  await TokenValidity.findOneAndDelete({ userId: user._id });
};

const getUserAndPasswordByUsername = async (username) => {
  return await User.findOne({ name: username }).populate("password");
};

const getMinTokenTimestamp = async (username) => {
  let timestamp = 0;
  const user = await User.findOne({ name: username });
  const tokenValidity = await TokenValidity.findOne({ userId: user._id });
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
