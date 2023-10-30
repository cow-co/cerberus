const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const pki = require("../../security/pki");
const accessManager = require("../../security/user-and-access-manager");
const dbManager = require("../../security/database-manager");
const adManager = require("../../security/active-directory-manager");

describe("Access Manager tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should handle PKI authentication properly", async () => {
    securityConfig.usePKI = true;
    const pkiCall = spyOn(pki, "extractUserDetails").and.returnValue("user");
    spyOn(dbManager, "authenticate").and.returnValue(true);
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
    expect(pkiCall.calls.count()).toBe(1);
    securityConfig.usePKI = false;
  });

  test("should handle authentication exception properly", async () => {
    spyOn(dbManager, "authenticate").and.throwError("TypeError");
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
    expect(res.errors.length).toBe(1);
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
    expect(res.errors.length).toBe(1);
  });

  test("should return an error when removing a user backed by AD", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;

    const errors = await accessManager.removeUser("userId");
    expect(errors.length).toBe(1);

    securityConfig.authMethod = prev;
  });

  test("should return an error when removing a user with unsupported auth method", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = "FAKE";

    const errors = await accessManager.removeUser("userId");
    expect(errors.length).toBe(1);

    securityConfig.authMethod = prev;
  });

  test("should return an error when exception in remove-user", async () => {
    spyOn(dbManager, "deleteUser").and.throwError("TypeError");
    const errors = await accessManager.removeUser("userId");
    expect(errors.length).toBe(1);
  });

  test("should find user by name from AD", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    spyOn(adManager, "findUserByName").and.returnValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserByName("user");

    expect(res.errors.length).toBe(0);
    expect(res.user.name).toBe("user");

    securityConfig.authMethod = prev;
  });

  test("should return an error when finding a user by name with unsupported auth method", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = "FAKE";

    const res = await accessManager.findUserByName("user");

    expect(res.errors.length).toBe(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = prev;
  });

  test("should find user by ID from AD", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    spyOn(adManager, "findUserById").and.returnValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserById("userId");

    expect(res.errors.length).toBe(0);
    expect(res.user.name).toBe("user");

    securityConfig.authMethod = prev;
  });

  test("should return an error when finding a user by ID with unsupported auth method", async () => {
    const prev = securityConfig.authMethod;
    securityConfig.authMethod = "FAKE";

    const res = await accessManager.findUserById("userId");

    expect(res.errors.length).toBe(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = prev;
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
    expect(res.errors.length).toBe(1);
    expect(resStatus).toBe(403);
  });
});
