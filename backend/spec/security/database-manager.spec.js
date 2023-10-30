const { purgeCache } = require("../utils");
const argon2 = require("argon2");
const userService = require("../../db/services/user-service");
const validation = require("../../validation/security-validation");
let manager;

describe("Database user manager tests - Register", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    const validationSpy = spyOn(validation, "validatePassword");
    validationSpy.withArgs("pass1").and.callFake((password) => {
      console.log("FAKING IT");
      return [];
    });
    validationSpy.withArgs("pass2").and.returnValue(["error"]);

    spyOn(argon2, "hash").and.resolveTo("hashed");

    const createUserSpy = spyOn(userService, "createUser");
    createUserSpy
      .withArgs({
        name: "user1",
        hashedPassword: "hashed",
      })
      .and.resolveTo({
        _id: "id",
      });
    createUserSpy
      .withArgs({
        name: "user2",
        hashedPassword: "hashed",
      })
      .and.throwError("TypeError");

    manager = require("../../security/database-manager");
  });

  afterEach(() => {
    delete require.cache[require.resolve("../../security/database-manager")];
  });

  test("should register", async () => {
    const result = await manager.register("user1", "pass1");
    expect(result.errors).to.be.empty;
  });

  test("should fail to register - exception", async () => {
    const result = await manager.register("user2", "pass1");
    expect(result.errors).to.not.be.empty;
  });

  test("should fail to register - validation error", async () => {
    const result = await manager.register("user1", "pass2");
    console.log(result.errors);
    expect(result.errors).to.not.be.empty;
  });
});
