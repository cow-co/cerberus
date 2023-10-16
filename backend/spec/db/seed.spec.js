const seeding = require("../../db/seed");
const adminService = require("../../db/services/admin-service");
const accessManager = require("../../security/user-and-access-manager");

describe("Seeding tests", () => {
  it("should seed admin - no admins, no users", async () => {
    spyOn(adminService, "numAdmins").and.returnValue(0);
    const addSpy = spyOn(adminService, "addAdmin");
    spyOn(accessManager, "findUserByName").and.returnValue(null);
    const regSpy = spyOn(accessManager, "register").and.returnValue({
      _id: "id",
      errors: [],
    });
    await seeding.seedInitialAdmin();
    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(regSpy).toHaveBeenCalledTimes(1);
  });
});
