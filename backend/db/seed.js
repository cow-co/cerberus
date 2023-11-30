const dbStateService = require("./services/db-state-service");
const taskTypeService = require("./services/tasks-service");
const adminService = require("./services/admin-service");
const accessManager = require("../security/user-and-access-manager");
const securityConfig = require("../config/security-config");
const { log, levels } = require("../utils/logger");

const seedTaskTypes = async () => {
  const defaultTaskTypes =
    require("../config/default-task-types.json").taskTypes;

  const numDbVersions = await dbStateService.getNumDbVersions();
  if (numDbVersions === 0) {
    defaultTaskTypes.forEach(
      async (taskType) => await taskTypeService.createTaskType(taskType)
    );
    await dbStateService.updateDBVersion();
  }
};

const seedInitialAdmin = async () => {
  const adminCount = await adminService.numAdmins();
  if (adminCount === 0) {
    let existing = await accessManager.findUserByName(
      securityConfig.initialAdmin.username
    );
    if (!existing.user) {
      existing = await accessManager.register(
        securityConfig.initialAdmin.username,
        securityConfig.initialAdmin.password
      );

      // Note: this will have errors if using AD auth and the user does not exist in AD
      // Since we cannot create AD users from here.
      if (existing.errors.length === 0) {
        await adminService.changeAdminStatus(existing._id, true);
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
      await adminService.changeAdminStatus(existing._id, true);
    }
  }
};

exports.seedTaskTypes = seedTaskTypes;
exports.seedInitialAdmin = seedInitialAdmin;
