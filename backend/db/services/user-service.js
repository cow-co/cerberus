const User = require("../models/User");

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
const findUser = async (username) => {
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
const createUser = async (user) => {
  return await User.create(user);
};

/**
 * If userId is null or undefined, mongoose should handle ensuring that no records are returned.
 * @param {string} userId
 * @returns
 */
const deleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
};

module.exports = {
  findUser,
  findUserById,
  createUser,
  deleteUser,
};
