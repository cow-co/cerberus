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

const changeAdminStatus = async (userId, shouldBeAdmin) => {
  if (userId) {
    const isAdmin = await isUserAdmin(userId);
    if (shouldBeAdmin && !isAdmin) {
      log("changeAdminStatus", `Adding user ${userId} as admin`, levels.INFO);
      await Admin.create({
        userId: userId,
      });
    } else if (!shouldBeAdmin && isAdmin) {
      log(
        "changeAdminStatus",
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
  changeAdminStatus,
  numAdmins,
};
