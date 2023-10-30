const seeding = require("../../db/seed");
const { purgeCache } = require("../utils");
const adminService = require("../../db/services/admin-service");
const accessManager = require("../../security/user-and-access-manager");
const dbStateService = require("../../db/services/db-state-service");
const taskTypeService = require("../../db/services/tasks-service");

describe("Seeding tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should seed admin - no admins, no users", async () => {
    spyOn(adminService, "numAdmins").and.returnValue(0);
    const addSpy = spyOn(adminService, "addAdmin");
    spyOn(accessManager, "findUserByName").and.returnValue({
      user: null,
      errors: [],
    });
    const regSpy = spyOn(accessManager, "register").and.returnValue({
      _id: "id",
      errors: [],
    });
    await seeding.seedInitialAdmin();
    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(regSpy).toHaveBeenCalledTimes(1);
  });

  test("should seed admin - no admins, user exists", async () => {
    spyOn(adminService, "numAdmins").and.returnValue(0);
    const addSpy = spyOn(adminService, "addAdmin");
    spyOn(accessManager, "findUserByName").and.returnValue({
      user: {
        id: "id",
        name: "user",
      },
      errors: [],
    });
    await seeding.seedInitialAdmin();
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  test("should not seed admin - admin exists", async () => {
    spyOn(adminService, "numAdmins").and.returnValue(1);
    const addSpy = spyOn(adminService, "addAdmin");
    await seeding.seedInitialAdmin();
    expect(addSpy).toHaveBeenCalledTimes(0);
  });

  test("should seed tasktypes", async () => {
    spyOn(dbStateService, "getNumDbVersions").and.returnValue(0);
    const taskTypeSpy = spyOn(taskTypeService, "createTaskType");
    spyOn(dbStateService, "updateDBVersion");
    await seeding.seedTaskTypes();
    expect(taskTypeSpy).toHaveBeenCalledTimes(3);
  });
});
