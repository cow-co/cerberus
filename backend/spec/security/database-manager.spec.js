const { purgeCache } = require("../utils");
const argon2 = require("argon2");
const userService = require("../../db/services/user-service");
const validation = require("../../validation/security-validation");
const manager = require("../../security/database-manager");
const { passwordRequirements } = require("../../config/security-config");

jest.mock("../../validation/security-validation");
jest.mock("../../db/services/user-service");
jest.mock("argon2");

describe("Database user manager tests - Register", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    argon2.hash.mockResolvedValue("hashed");
  });

  test("should register", async () => {
    userService.createUser.mockResolvedValue({
      _id: "id",
    });
    validation.validatePassword.mockReturnValue([]);

    const result = await manager.register(
      "user1",
      "pass1",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(0);
  });

  test("should fail to register - exception", async () => {
    userService.createUser.mockRejectedValue(new Error("error"));
    validation.validatePassword.mockReturnValue([]);

    const result = await manager.register(
      "user2",
      "pass1",
      passwordRequirements
    );

    expect(result.errors).toHaveLength(1);
  });

  test("should fail to register - validation error", async () => {
    userService.createUser.mockResolvedValue({
      _id: "id",
    });
    validation.validatePassword.mockReturnValue(["error"]);

    const result = await manager.register(
      "user1",
      "pass2",
      passwordRequirements
    );

    console.log(result.errors);
    expect(result.errors).toHaveLength(1);
  });
});
