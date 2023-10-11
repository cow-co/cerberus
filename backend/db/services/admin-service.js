const Admin = require("../models/Admin");

/**
 * @param {string} userId The ID of the user to check (if using AD authentication, this will be the DN of the user)
 * @returns `true` if user is an admin, `false` if not
 */
const isUserAdmin = async (userId) => {
  const adminRecord = await Admin.findOne({ userId: userId });
  return adminRecord !== null;
};

/**
 * This ensures the given user is an admin - if they are already, then it does nothing.
 * @param {string} userId The ID of the user to make into an admin (if using AD authentication, this will be the DN of the user)
 */
const addAdmin = async (userId) => {
  const exists = await isUserAdmin(userId);
  if (!exists) {
    await Admin.create({
      userId: userId,
    });
  }
};

/**
 * This ensures the given user is not an admin - if they are not already, then it does nothing.
 * @param {string} userId ID of the user to remove from the admins list (if using AD authentication, this will be the DN of the user)
 */
const removeAdmin = async (userId) => {
  const existingAdminRecord = await Admin.findOne({ userId: userId });
  if (existingAdminRecord !== null) {
    await existingAdminRecord.deleteOne();
  }
};

/**
 * @returns Count of all admin users
 */
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
