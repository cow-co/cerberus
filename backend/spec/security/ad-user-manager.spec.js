const securityConfig = require("../../config/security-config");
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

  it("should authenticate successfully - pki", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "userExists").and.callFake(
      (username, callback) => callback(null, true)
    );
    const res = await adUserManager.authenticate("user", null);
    expect(res).to.be.true;
    securityConfig.usePKI = false;
  });

  it("should fail to authenticate - pki", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "userExists").and.callFake(
      (username, callback) => callback(null, false)
    );
    const res = await adUserManager.authenticate("user", null);
    expect(res).to.be.false;
    securityConfig.usePKI = false;
  });

  it("should find a user", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "findUser").and.callFake(
      (username, callback) =>
        callback(null, { sn: "123", sAMAccountName: "user" })
    );
    const res = await adUserManager.findUserByName("user");
    expect(res).to.deep.equal({ id: "123", name: "user" });
    securityConfig.usePKI = false;
  });

  it("should not find a user", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "findUser").and.callFake(
      (username, callback) => callback(null, null)
    );
    const res = await adUserManager.findUserByName("user");
    expect(res).to.equal(null);
    securityConfig.usePKI = false;
  });
});
