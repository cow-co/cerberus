const { purgeCache } = require("../utils");
const adUserManager = require("../../security/active-directory-manager");

const ActiveDirectory = require("activedirectory");
jest.mock("activedirectory");

describe("AD User Manager Tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should authenticate successfully", async () => {
    ActiveDirectory.prototype.authenticate.mockImplementation(
      (username, password, callback) => callback(null, true)
    );

    const res = await adUserManager.authenticate("user", "pw", false);

    expect(res).toBe(true);
  });

  test("should fail to authenticate", async () => {
    ActiveDirectory.prototype.authenticate.mockImplementation(
      (username, password, callback) => callback(null, false)
    );

    const res = await adUserManager.authenticate("user", "pw", false);

    expect(res).toBe(false);
  });

  test("should authenticate successfully - pki", async () => {
    ActiveDirectory.prototype.userExists.mockImplementation(
      (username, callback) => callback(null, true)
    );

    const res = await adUserManager.authenticate("user", null, true);

    expect(res).toBe(true);
  });

  test("should fail to authenticate - pki", async () => {
    ActiveDirectory.prototype.userExists.mockImplementation(
      (username, callback) => callback(null, false)
    );

    const res = await adUserManager.authenticate("user", null, true);

    expect(res).toBe(false);
  });

  test("should find a user", async () => {
    ActiveDirectory.prototype.findUser.mockImplementation(
      (username, callback) =>
        callback(null, { sn: "123", sAMAccountName: "user" })
    );

    const res = await adUserManager.findUserByName("user");

    expect(res).toEqual({ id: "123", name: "user" });
  });

  test("should not find a user", async () => {
    ActiveDirectory.prototype.findUser.mockImplementation(
      (username, callback) => callback(null, null)
    );

    const res = await adUserManager.findUserByName("user");

    expect(res).toBe(null);
  });
});
