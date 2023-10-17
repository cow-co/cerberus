const adUserManager = require("../../security/active-directory-manager");
const expect = require("chai").expect;
const ActiveDirectory = require("activedirectory");

describe("AD User Manager Tests", () => {
  it("should authenticate successfully", async () => {
    spyOn(ActiveDirectory.prototype, "authenticate").and.callFake(
      (username, password, callback) => callback(null, true)
    );
    const res = await adUserManager.authenticate("user", "pw");
    expect(res).to.be.true;
  });

  it("should fail to authenticate", async () => {
    spyOn(ActiveDirectory.prototype, "authenticate").and.callFake(
      (username, password, callback) => callback(null, false)
    );
    const res = await adUserManager.authenticate("user", "pw");
    expect(res).to.be.false;
  });
});
