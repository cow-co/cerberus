const User = require("../models/User");

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

module.exports = {
  findUser,
  findUserById,
  createUser,
};
