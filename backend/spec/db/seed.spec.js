const seeding = require("../../db/seed");
const { purgeCache } = require("../utils");
const adminService = require("../../db/services/admin-service");
const accessManager = require("../../security/user-and-access-manager");
const taskTypeService = require("../../db/services/tasks-service");

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
      _id: "",
      name: "",
    });
    accessManager.register.mockResolvedValue({
      _id: "id",
      errors: [],
    });

    await seeding.seedInitialAdmin();

    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(1);
    expect(accessManager.register).toHaveBeenCalledTimes(1);
  });

  test("should seed admin - no admins, user exists", async () => {
    adminService.numAdmins.mockResolvedValue(0);
    accessManager.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
    });

    await seeding.seedInitialAdmin();

    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(1);
    expect(accessManager.register).toHaveBeenCalledTimes(0);
  });

  test("should not seed admin - admin exists", async () => {
    adminService.numAdmins.mockResolvedValue(1);

    await seeding.seedInitialAdmin();

    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(0);
  });

  test("should not seed admin - error", async () => {
    adminService.numAdmins.mockResolvedValue(0);
    accessManager.findUserByName.mockResolvedValue({
      _id: "",
      name: "",
    });
    accessManager.register.mockResolvedValue({
      _id: null,
      errors: ["error"],
    });

    await seeding.seedInitialAdmin();

    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(0);
  });

  test("seed tasktypes - success - empty existing-list", async () => {
    taskTypeService.getTaskTypes.mockResolvedValue([]);

    await seeding.seedTaskTypes();

    expect(taskTypeService.createTaskType).toHaveBeenCalledTimes(3);
  });

  test("seed tasktypes - success - null existing-list", async () => {
    taskTypeService.getTaskTypes.mockResolvedValue(null);

    await seeding.seedTaskTypes();

    expect(taskTypeService.createTaskType).toHaveBeenCalledTimes(3);
  });

  test("seed tasktypes - success - taktypes not seeded", async () => {
    taskTypeService.getTaskTypes.mockResolvedValue(["TEST"]);

    await seeding.seedTaskTypes();

    expect(taskTypeService.createTaskType).toHaveBeenCalledTimes(0);
  });
});
