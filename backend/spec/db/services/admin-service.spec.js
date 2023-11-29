const Admin = require("../../../db/models/Admin");
const adminService = require("../../../db/services/admin-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/Admin");

describe("Admin service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("check admin - true", async () => {
    Admin.findOne.mockResolvedValue({
      userId: "id",
    });

    const result = await adminService.isUserAdmin("id");

    expect(result).toBe(true);
  });

  test("check admin - false - admin record does not exist", async () => {
    Admin.findOne.mockResolvedValue(null);

    const result = await adminService.isUserAdmin("id");

    expect(result).toBe(false);
  });

  test("check admin - false - userId null", async () => {
    const result = await adminService.isUserAdmin(null);

    expect(result).toBe(false);
  });

  test("add admin - success", async () => {
    Admin.findOne.mockResolvedValue(null);

    await adminService.changeAdminStatus("id", true);

    expect(Admin.create).toHaveBeenCalledTimes(1);
  });

  test("add admin - noop - user already admin", async () => {
    Admin.findOne.mockResolvedValue({
      userId: "id",
    });

    await adminService.changeAdminStatus("id", true);

    expect(Admin.create).toHaveBeenCalledTimes(0);
  });

  test("add admin - noop - user ID is null", async () => {
    jest.spyOn(adminService, "isUserAdmin").mockResolvedValue(false);

    await adminService.changeAdminStatus(null, true);

    expect(Admin.create).toHaveBeenCalledTimes(0);
  });

  test("delete admin - success", async () => {
    let called = false;
    Admin.findOne.mockResolvedValue({
      userId: "id",
      deleteOne: async () => {
        called = true;
      },
    });

    await adminService.changeAdminStatus("id", false);

    expect(called).toBe(true);
  });

  test("delete admin - noop - admin does not exist", async () => {
    Admin.findOne.mockResolvedValue(null);

    await adminService.changeAdminStatus("id", false);

    expect(Admin.deleteOne).toHaveBeenCalledTimes(0);
  });

  test("delete admin - noop - user ID is null", async () => {
    await adminService.changeAdminStatus(null, false);

    expect(Admin.findOne).toHaveBeenCalledTimes(0);
  });

  test("count admins", async () => {
    Admin.countDocuments.mockResolvedValue(2);

    const count = await adminService.numAdmins();

    expect(count).toBe(2);
  });
});
