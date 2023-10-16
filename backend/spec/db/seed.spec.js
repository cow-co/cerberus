const seeding = require("../../db/seed");
const adminService = require("../../db/services/admin-service");

describe("Seeding tests", () => {
  it("should seed", async () => {
    const numSpy = spyOn(adminService, "numAdmins").and.callFake(() => {
      console.log("FAKEY");
    });
    const addSpy = spyOn(adminService, "addAdmin");
    const accessManager = require("../../security/user-and-access-manager");
    const nameSpy = spyOn(accessManager, "findUserByName");
    const regSpy = spyOn(accessManager, "register");
    await seeding.seedInitialAdmin();
    expect(numSpy).toHaveBeenCalledTimes(1);
    expect(nameSpy).toHaveBeenCalledTimes(1);
  });
});
