const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const adUserManager = require("../../security/active-directory-manager");

const ActiveDirectory = require("activedirectory");

describe("AD User Manager Tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should authenticate successfully", async () => {
    spyOn(ActiveDirectory.prototype, "authenticate").and.callFake(
      (username, password, callback) => callback(null, true)
    );
    const res = await adUserManager.authenticate("user", "pw");
    expect(res).toBe(true);
  });

  test("should fail to authenticate", async () => {
    spyOn(ActiveDirectory.prototype, "authenticate").and.callFake(
      (username, password, callback) => callback(null, false)
    );
    const res = await adUserManager.authenticate("user", "pw");
    expect(res).toBe(false);
  });

  test("should authenticate successfully - pki", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "userExists").and.callFake(
      (username, callback) => callback(null, true)
    );
    const res = await adUserManager.authenticate("user", null);
    expect(res).toBe(true);
    securityConfig.usePKI = false;
  });

  test("should fail to authenticate - pki", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "userExists").and.callFake(
      (username, callback) => callback(null, false)
    );
    const res = await adUserManager.authenticate("user", null);
    expect(res).toBe(false);
    securityConfig.usePKI = false;
  });

  test("should find a user", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "findUser").and.callFake(
      (username, callback) =>
        callback(null, { sn: "123", sAMAccountName: "user" })
    );
    const res = await adUserManager.findUserByName("user");
    expect(res).to.deep.equal({ id: "123", name: "user" });
    securityConfig.usePKI = false;
  });

  test("should not find a user", async () => {
    securityConfig.usePKI = true;
    spyOn(ActiveDirectory.prototype, "findUser").and.callFake(
      (username, callback) => callback(null, null)
    );
    const res = await adUserManager.findUserByName("user");
    expect(res).toBe(null);
    securityConfig.usePKI = false;
  });
});
