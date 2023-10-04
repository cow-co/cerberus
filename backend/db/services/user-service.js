const User = require("../models/User");

// These just provide a little layer of abstraction over the underlying database implementation; we could potentially put this into the `database-manager` file,
// but that would mean we're putting DB logic in two different dirs, which is a little messy, and could become problematic if we ever supported diffeerent DBMSs

const findUser = async (username) => {
  const user = await User.findOne({ name: username });
  return user;
};

const findUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

const createUser = async (user) => {
  return await User.create(user);
};

const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

module.exports = {
  findUser,
  findUserById,
  createUser,
  deleteUser,
};
