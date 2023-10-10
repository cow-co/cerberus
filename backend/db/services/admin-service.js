const Admin = require("../models/Admin");
const User = require("../models/User");

// TODO Call these from the API
const isUserAdmin = async (userId) => {
  const adminRecord = await Admin.findOne({ userId: userId });
  return adminRecord !== null;
};

// This ensures the given user is an admin - if they are already, then it does nothing.
const addAdmin = async (userId) => {
  const exists = await isUserAdmin(userId);
  if (!exists) {
    await Admin.create({
      userId: userId,
    });
  }
};

// This ensures the given user is not an admin - if they are not already, then it does nothing.
const removeAdmin = async (userId) => {
  const existingAdminRecord = await Admin.findOne({ userId: userId });
  if (existingAdminRecord !== null) {
    await existingAdminRecord.deleteOne();
  }
};

const numAdmins = async () => {
  const allAdmins = await Admin.countDocuments({});
  return allAdmins;
};

module.exports = {
  isUserAdmin,
  addAdmin,
  removeAdmin,
  numAdmins,
};
