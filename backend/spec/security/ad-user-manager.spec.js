const { purgeCache } = require("../utils");
const adUserManager = require("../../security/active-directory-manager");
const userService = require("../../db/services/user-service");
const adminService = require("../../db/services/admin-service");
const TokenValidity = require("../../db/models/TokenValidity");

const ActiveDirectory = require("activedirectory");
jest.mock("activedirectory");
jest.mock("../../db/services/user-service");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/models/TokenValidity");

describe("AD User Manager Tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("authenticate - success", async () => {
    ActiveDirectory.prototype.authenticate.mockImplementation(
      (username, password, callback) => callback(null, true)
    );

    const res = await adUserManager.authenticate("user", "pw", false);

    expect(res).toBe(true);
  });

  test("authenticate - failure", async () => {
    ActiveDirectory.prototype.authenticate.mockImplementation(
      (username, password, callback) => callback(null, false)
    );

    const res = await adUserManager.authenticate("user", "pw", false);

    expect(res).toBe(false);
  });

  test("authenticate - success - pki", async () => {
    ActiveDirectory.prototype.userExists.mockImplementation(
      (username, callback) => callback(null, true)
    );

    const res = await adUserManager.authenticate("user", null, true);

    expect(res).toBe(true);
  });

  test("authenticate - failure - pki", async () => {
    ActiveDirectory.prototype.userExists.mockImplementation(
      (username, callback) => callback(null, false)
    );

    const res = await adUserManager.authenticate("user", null, true);

    expect(res).toBe(false);
  });

  test("find user - success", async () => {
    ActiveDirectory.prototype.findUser.mockImplementation(
      (username, callback) =>
        callback(null, { userPrincipalName: "123", sAMAccountName: "user" })
    );

    const res = await adUserManager.findUserByName("user");

    expect(res).toEqual({ id: "123", name: "user" });
  });

  test("find user - failure - user does not exist", async () => {
    ActiveDirectory.prototype.findUser.mockImplementation(
      (username, callback) => callback(null, null)
    );

    const res = await adUserManager.findUserByName("user");

    expect(res).toEqual({ id: "", name: "" });
  });

  test("delete user - success", async () => {
    await adUserManager.deleteUser("id");

    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(1);
  });

  test("logout - success - existing entry", async () => {
    let newValidity = -1;
    TokenValidity.findOne.mockResolvedValue({
      userId: "id",
      minTokenValidity: 0,
      save: async function () {
        newValidity = this.minTokenValidity;
      },
    });

    await adUserManager.logout("id");

    expect(newValidity).toBeGreaterThan(0);
  });

  test("logout - success - no existing entry", async () => {
    TokenValidity.findOne.mockResolvedValue(null);

    await adUserManager.logout("id");

    expect(TokenValidity.create).toHaveBeenCalledTimes(1);
  });

  test("get groups - success", () => {
    ActiveDirectory.prototype.getGroupMembershipForUser.mockImplementation(
      (username, callback) => {
        callback(null, ["group 1", "group 2"]);
      }
    );

    const groups = adUserManager.getGroupsForUser("id");

    expect(groups).toHaveLength(2);
  });
});
