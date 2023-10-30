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

  // TODO Implement
  test("authenticate - success - AD", () => {});

  test("authenticate - success - PKI", async () => {
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

  test("authenticate - failure - exception", async () => {
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

  test("authenticate - failure - unsupported auth method", () => {});

  test("authenticate - failure - incorrect credentials", () => {});

  test("check admin - success", () => {});

  test("check admin - failure - logged in user does not exist", () => {});

  test("check admin - failure - user is not admin", () => {});

  test("check admin - failure - user not logged in", async () => {
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

  test("remove user - failure - AD", async () => {
    // TODO Make this actually use the AD auth method
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("remove user - failure - unsupported auth method", async () => {
    // TODO Make this actually use the fake auth method
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("remove user - failure - exception", async () => {
    dbManager.deleteUser.mockRejectedValue(new Error("TypeError"));

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("remove user - failure - AD", () => {});

  test("find user by name - success - DB", () => {});

  test("find user by name - success - AD", async () => {
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

  test("find user by name - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("find user by name - failure - exception", () => {});

  test("find user by ID - success - DB", () => {});

  test("find user by ID - success - AD", async () => {
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

  test("find user by ID - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toBe(null);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("find user by ID - failure - exception", () => {});

  test("verify session - success - no PKI", async () => {
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

  test("verify session - failure", async () => {
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

  test("verify session - success - PKI", () => {});

  test("logout - success", () => {});

  test("register - success", () => {});

  test("register - failure - AD", () => {});
});
