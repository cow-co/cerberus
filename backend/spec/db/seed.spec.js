const seeding = require("../../db/seed");
const adminService = require("../../db/services/admin-service");
const accessManager = require("../../security/user-and-access-manager");
const ActiveDirectory = require("activedirectory");

describe("Seeding tests", () => {
  it("should seed admin - no admins, no users", async () => {
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

  it("should seed admin - no admins, user exists", async () => {
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

  it("should not seed admin - admin exists", async () => {
    spyOn(adminService, "numAdmins").and.returnValue(1);
    const addSpy = spyOn(adminService, "addAdmin");
    await seeding.seedInitialAdmin();
    expect(addSpy).toHaveBeenCalledTimes(0);
  });

  it("should seed tasktypes", () => {});
});
