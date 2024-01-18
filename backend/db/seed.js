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
  log("seedInitialAdmin", "Seeding admin", levels.INFO);
  const adminCount = await adminService.numAdmins();
  if (adminCount === 0) {
    let existing = await accessManager.findUserByName(
      securityConfig.initialAdmin.username
    );
    if (!existing.user.id) {
      existing = await accessManager.register(
        securityConfig.initialAdmin.username,
        securityConfig.initialAdmin.password
      );

      if (existing.errors.length === 0) {
        log("seedInitialAdmin", "Initial admin user created", levels.DEBUG);
        await adminService.changeAdminStatus(existing._id, true);
        log("seedInitialAdmin", "Initial admin set to admin", levels.INFO);
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
      log(
        "seedInitialAdmin",
        `setting ${existing.user.id} to admin`,
        levels.DEBUG
      );
      await adminService.changeAdminStatus(existing.user.id, true);
      log("seedInitialAdmin", "Initial admin set to admin", levels.INFO);
    }
  }
};

exports.seedTaskTypes = seedTaskTypes;
exports.seedInitialAdmin = seedInitialAdmin;
