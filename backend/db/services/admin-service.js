const Admin = require("../models/Admin");
const User = require("../models/User");

// TODO Call these from the API
// TODO the way I envisage this working is that the admin types in a username, searches it, then submits the found user record
//  (the UI layer will pick out the user _id and send it)
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

module.exports = {
  isUserAdmin,
  addAdmin,
  removeAdmin,
};
