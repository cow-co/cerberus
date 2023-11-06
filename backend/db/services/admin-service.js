const { log, levels } = require("../../utils/logger");
const Admin = require("../models/Admin");

/**
 * @param {string} userId The ID of the user to check (if using AD authentication, this will be the DN of the user)
 * @returns `true` if user is an admin, `false` if not
 */
const isUserAdmin = async (userId) => {
  let res = false;

  if (userId) {
    const adminRecord = await Admin.findOne({ userId: userId });
    res = adminRecord !== null;
  }

  return res;
};

/**
 * This ensures the given user is an admin - if they are already, then it does nothing.
 * @param {string} userId The ID of the user to make into an admin (if using AD authentication, this will be the DN of the user)
 */
const addAdmin = async (userId) => {
  if (userId) {
    const exists = await isUserAdmin(userId);
    if (!exists) {
      log("addAdmin", `Adding user ${userId} as admin`, levels.INFO);
      await Admin.create({
        userId: userId,
      });
    }
  }
};

/**
 * This ensures the given user is not an admin - if they are not already, then it does nothing.
 * @param {string} userId ID of the user to remove from the admins list (if using AD authentication, this will be the DN of the user)
 */
const removeAdmin = async (userId) => {
  if (userId) {
    const existingAdminRecord = await Admin.findOne({ userId: userId });
    if (existingAdminRecord) {
      log(
        "removeAdmin",
        `Deleting admin record for user ID ${userId}`,
        levels.INFO
      );
      await existingAdminRecord.deleteOne();
    }
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
