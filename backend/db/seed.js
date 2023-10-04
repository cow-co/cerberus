const {
  getNumDbVersions,
  updateDBVersion,
} = require("./services/db-state-service");
const { createTaskType } = require("./services/tasks-service");
const { findUser } = require("./services/user-service");
const { addAdmin, numAdmins } = require("./services/admin-service");
const { register } = require("../security/access-manager");
const securityConfig = require("../config/security-config");

const seedTaskTypes = async () => {
  const defaultTaskTypes = [
    {
      name: "Set Beacon Interval",
      params: ["New Interval"],
    },
    {
      name: "Download",
      params: ["Source", "Destination"],
    },
    {
      name: "Run Command",
      params: ["Command"],
    },
  ];

  const numDbVersions = await getNumDbVersions();
  if (numDbVersions === 0) {
    defaultTaskTypes.forEach(
      async (taskType) => await createTaskType(taskType)
    );
    await updateDBVersion();
  }
};

const seedInitialAdmin = async () => {
  let existing = await findUser(securityConfig.initialAdmin.username);
  const adminCount = await numAdmins();
  if (adminCount === 0) {
    if (!existing) {
      existing = await register(
        securityConfig.initialAdmin.username,
        securityConfig.initialAdmin.password
      );

      if (existing.errors.length === 0) {
        addAdmin(existing._id);
      }
    } else {
      addAdmin(existing._id);
    }
  }
};

module.exports = {
  seedTaskTypes,
  seedInitialAdmin,
};
