const dbStateService = require("./services/db-state-service");
const taskTypeService = require("./services/tasks-service");
const adminService = require("./services/admin-service");
const accessManager = require("../security/user-and-access-manager");
const securityConfig = require("../config/security-config");
const { log, levels } = require("../utils/logger");

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

  const numDbVersions = await dbStateService.getNumDbVersions();
  if (numDbVersions === 0) {
    defaultTaskTypes.forEach(
      async (taskType) => await taskTypeService.createTaskType(taskType)
    );
    await dbStateService.updateDBVersion();
  }
};

const seedInitialAdmin = async () => {
  console.log("Counting admins...");
  const adminCount = await adminService.numAdmins();
  console.log(adminCount);
  if (adminCount === 0) {
    console.log("Finding user...");
    let existing = await accessManager.findUserByName(
      securityConfig.initialAdmin.username
    );
    if (!existing) {
      console.log("Registering...");
      existing = await accessManager.register(
        securityConfig.initialAdmin.username,
        securityConfig.initialAdmin.password
      );

      if (existing.errors.length === 0) {
        console.log("Adding the new user...");
        await adminService.addAdmin(existing._id);
      } else {
        log(
          "seedInitialAdmin",
          `Errors when creating initial admin: ${JSON.stringify(
            existing.errors
          )}`,
          levels.ERROR
        );
      }
    } else {
      console.log("Adding the existing user...");
      await adminService.addAdmin(existing._id);
    }
  }
};

exports.seedTaskTypes = seedTaskTypes;
exports.seedInitialAdmin = seedInitialAdmin;
