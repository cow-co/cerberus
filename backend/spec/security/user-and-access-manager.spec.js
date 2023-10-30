const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const pki = require("../../security/pki");
const accessManager = require("../../security/user-and-access-manager");
const dbManager = require("../../security/database-manager");
const adManager = require("../../security/active-directory-manager");

jest.mock("../../security/pki");
jest.mock("../../security/database-manager");
jest.mock("../../security/active-directory-manager");

describe("Access Manager tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should handle PKI authentication properly", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.authenticate.mockResolvedValue(true);

    let called = false;
    await accessManager.authenticate(
      {
        session: {},
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(pki.extractUserDetails).toBeCalledTimes(1);

    securityConfig.usePKI = false;
  });

  test("should handle authentication exception properly", async () => {
    dbManager.authenticate.mockRejectedValue(new Error("TypeError"));

    let called = false;
    let resStatus = 200;
    let res = {};
    await accessManager.authenticate(
      {
        body: {
          username: "ksdah",
          password: "kjsdahf",
        },
      },
      {
        status: (status) => {
          resStatus = status;
          return {
            json: (data) => {
              res = data;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(false);
    expect(resStatus).toBe(500);
    expect(res.errors).toHaveLength(1);
  });

  test("should handle check-admin user missing properly", async () => {
    let resStatus = 200;
    let res = {};
    await accessManager.checkAdmin(
      { session: {} },
      {
        status: (status) => {
          resStatus = status;
          return { json: (data) => (res = data) };
        },
      },
      () => {}
    );

    expect(resStatus).toBe(403);
    expect(res.errors).toHaveLength(1);
  });

  test("should return an error when removing a user backed by AD", async () => {
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("should return an error when removing a user with unsupported auth method", async () => {
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("should return an error when exception in remove-user", async () => {
    dbManager.deleteUser.mockRejectedValue(new Error("TypeError"));

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("should find user by name from AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(0);
    expect(res.user.name).toBe("user");

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("should return an error when finding a user by name with unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("should find user by ID from AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.findUserById.mockResolvedValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(0);
    expect(res.user.name).toBe("user");

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("should return an error when finding a user by ID with unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("should successfully verify session", async () => {
    let called = false;
    await accessManager.verifySession(
      {
        session: {
          username: "user",
        },
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
  });

  test("should fail to verify session", async () => {
    let called = false;
    let resStatus = 200;
    let res = {};
    await accessManager.verifySession(
      {
        session: {},
      },
      {
        status: (statusCode) => {
          resStatus = statusCode;
          return {
            json: (data) => {
              res = data;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(false);
    expect(res.errors).toHaveLength(1);
    expect(resStatus).toBe(403);
  });
});
