const seeding = require("../../db/seed");
const { purgeCache } = require("../utils");
const adminService = require("../../db/services/admin-service");
const accessManager = require("../../security/user-and-access-manager");
const dbStateService = require("../../db/services/db-state-service");
const taskTypeService = require("../../db/services/tasks-service");

jest.mock("../../db/services/db-state-service");
jest.mock("../../db/services/tasks-service");
jest.mock("../../db/services/admin-service");
jest.mock("../../security/user-and-access-manager");

describe("Seeding tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should seed admin - no admins, no users", async () => {
    adminService.numAdmins.mockResolvedValue(0);
    accessManager.findUserByName.mockResolvedValue({
      user: null,
      errors: [],
    });
    accessManager.register.mockResolvedValue({
      _id: "id",
      errors: [],
    });

    await seeding.seedInitialAdmin();

    expect(adminService.addAdmin).toHaveBeenCalledTimes(1);
    expect(accessManager.register).toHaveBeenCalledTimes(1);
  });

  test("should seed admin - no admins, user exists", async () => {
    adminService.numAdmins.mockResolvedValue(0);
    accessManager.findUserByName.mockResolvedValue({
      user: {
        id: "id",
        name: "user",
      },
      errors: [],
    });

    await seeding.seedInitialAdmin();

    expect(adminService.addAdmin).toHaveBeenCalledTimes(1);
    expect(accessManager.register).toHaveBeenCalledTimes(0);
  });

  test("should not seed admin - admin exists", async () => {
    adminService.numAdmins.mockResolvedValue(1);

    await seeding.seedInitialAdmin();

    expect(adminService.addAdmin).toHaveBeenCalledTimes(0);
  });

  test("should seed tasktypes", async () => {
    dbStateService.getNumDbVersions.mockResolvedValue(0);

    await seeding.seedTaskTypes();

    expect(taskTypeService.createTaskType).toHaveBeenCalledTimes(3);
  });
});
