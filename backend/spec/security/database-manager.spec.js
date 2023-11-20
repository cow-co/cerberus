const { purgeCache } = require("../utils");
const argon2 = require("argon2");
const userService = require("../../db/services/user-service");
const adminService = require("../../db/services/admin-service");
const validation = require("../../validation/security-validation");
const manager = require("../../security/database-manager");
const { passwordRequirements } = require("../../config/security-config");
const TokenValidity = require("../../db/models/TokenValidity");

jest.mock("../../validation/security-validation");
jest.mock("../../db/services/user-service");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/models/TokenValidity");
jest.mock("argon2");

describe("Database user manager tests", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    argon2.hash.mockResolvedValue("hashed");
  });

  test("register - success", async () => {
    userService.createUser.mockResolvedValue({
      _id: "id",
    });
    validation.validatePassword.mockReturnValue([]);
    validation.validateUsername.mockReturnValue([]);

    const result = await manager.register(
      "user1",
      "pass1",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(0);
  });

  test("register - failure - exception", async () => {
    userService.createUser.mockRejectedValue(new Error("error"));
    validation.validatePassword.mockReturnValue([]);
    validation.validateUsername.mockReturnValue([]);

    const result = await manager.register(
      "user2",
      "pass1",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(1);
  });

  test("register - failure - password validation error", async () => {
    userService.createUser.mockResolvedValue({
      _id: "id",
    });
    validation.validatePassword.mockReturnValue(["error"]);
    validation.validateUsername.mockReturnValue([]);

    const result = await manager.register(
      "user1",
      "pass2",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(1);
  });

  test("register - failure - username validation error", async () => {
    userService.createUser.mockResolvedValue({
      _id: "id",
    });
    validation.validatePassword.mockReturnValue([]);
    validation.validateUsername.mockReturnValue(["error"]);

    const result = await manager.register(
      "user1",
      "pass2",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(1);
  });

  test("authenticate - success - no PKI", async () => {
    argon2.verify.mockResolvedValue(true);
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      _id: "id",
      name: "user",
      password: {
        _id: "hashId",
        hashedPassword: "hash",
      },
    });

    const auth = await manager.authenticate("user", "pass", false);

    expect(auth).toBe(true);
  });

  test("authenticate - success - PKI", async () => {
    userService.findUserByName.mockResolvedValue({
      _id: "id",
    });

    const auth = await manager.authenticate("user", null, true);

    expect(auth).toBe(true);
  });

  test("authenticate - failure - no username", async () => {
    const auth = await manager.authenticate(null, "pass", false);

    expect(auth).toBe(false);
  });

  test("authenticate - failure - user not found", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue(null);

    const auth = await manager.authenticate("user", "pass", false);

    expect(auth).toBe(false);
  });

  test("authenticate - failure - password wrong", async () => {
    argon2.verify.mockResolvedValue(false);
    userService.findUserByName.mockResolvedValue({
      _id: "id",
    });

    const auth = await manager.authenticate("user", "pass", false);

    expect(auth).toBe(false);
  });

  test("find user by ID - success - user found", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
    });

    const user = await manager.findUserById("id");

    expect(user.id).toBe("id");
  });

  test("find user by ID - success - no user found", async () => {
    userService.findUserById.mockResolvedValue(null);

    const user = await manager.findUserById("id");

    expect(user).toBeNull();
  });

  test("find user by name - success - user found", async () => {
    userService.findUserByName.mockResolvedValue({
      _id: "id",
    });

    const user = await manager.findUserByName("user");

    expect(user.id).toBe("id");
  });

  test("find user by name - success - no user found", async () => {
    userService.findUserByName.mockResolvedValue(null);

    const user = await manager.findUserByName("user");

    expect(user).toBeNull();
  });

  test("logout - success", async () => {
    await manager.logout("id");

    expect(TokenValidity.create).toHaveBeenCalledTimes(1);
  });

  test("logout - success - validity entry exists", async () => {
    let newTimestamp = 0;
    TokenValidity.findOne.mockResolvedValue({
      minTokenValidity: 100,
      save: async function () {
        newTimestamp = this.minTokenValidity;
      },
    });

    await manager.logout("id");

    expect(TokenValidity.create).toHaveBeenCalledTimes(0);
    expect(newTimestamp).toBeGreaterThan(100);
  });

  test("delete user - success", async () => {
    await manager.deleteUser("id");

    expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    expect(adminService.removeAdmin).toHaveBeenCalledTimes(1);
  });

  test("check group membership - success", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "hashId",
      acgs: ["acg1"],
    });

    const isInGroup = await manager.isUserInGroup("id", "acg1");

    expect(isInGroup).toBe(true);
  });

  test("check group membership - success - multiple groups on user", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "hashId",
      acgs: ["acg1", "acg2", "acg3"],
    });

    const isInGroup = await manager.isUserInGroup("id", "acg2");

    expect(isInGroup).toBe(true);
  });

  test("check group membership - failure", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "hashId",
      acgs: ["acg1"],
    });

    const isInGroup = await manager.isUserInGroup("id", "acg2");

    expect(isInGroup).toBe(false);
  });
});
