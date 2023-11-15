const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const pki = require("../../security/pki");
const dbManager = require("../../security/database-manager");
const adManager = require("../../security/active-directory-manager");
const adminService = require("../../db/services/admin-service");
let accessManager;

jest.mock("../../security/pki");
jest.mock("../../security/database-manager");
jest.mock("../../security/active-directory-manager");
jest.mock("../../db/services/admin-service");

describe("Access Manager tests", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeAll(() => {
    accessManager = require("../../security/user-and-access-manager");
  });

  test("authenticate - success - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.authenticate.mockResolvedValue(true);

    let called = false;
    await accessManager.authenticate(
      {
        body: {
          username: "user",
          password: "pass",
        },
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(adManager.authenticate).toHaveBeenCalledTimes(1);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("authenticate - success - PKI", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.authenticate.mockResolvedValue(true);

    let called = false;
    await accessManager.authenticate({}, null, () => {
      called = true;
    });

    expect(called).toBe(true);
    expect(pki.extractUserDetails).toHaveBeenCalledTimes(1);

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

  test("authenticate - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    let called = false;
    let statusCode = 200;
    let errors = [];

    await accessManager.authenticate(
      {
        body: {
          username: "user",
          password: "pass",
        },
      },
      {
        status: (status) => {
          statusCode = status;
          return {
            json: (data) => {
              errors = data.errors;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(false);
    expect(statusCode).toBe(500);
    expect(errors).toHaveLength(1);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("authenticate - failure - incorrect credentials", async () => {
    dbManager.authenticate.mockResolvedValue(false);
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
    expect(resStatus).toBe(401);
    expect(res.errors).toHaveLength(1);
  });

  test("check admin - success", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(true);
    let calledNext = false;

    await accessManager.checkAdmin(
      {
        data: { username: "user" },
      },
      null,
      () => {
        calledNext = true;
      }
    );

    expect(calledNext).toBe(true);
  });

  test("check admin - failure - logged in user does not exist", async () => {
    dbManager.findUserByName.mockResolvedValue(null);
    adminService.isUserAdmin.mockResolvedValue(true);
    let resStatus = 500;
    let calledNext = false;
    let res = {};

    await accessManager.checkAdmin(
      {
        data: { username: "user" },
      },
      {
        status: (status) => {
          resStatus = status;
          return { json: (data) => (res = data) };
        },
      },
      () => {
        calledNext = true;
      }
    );

    expect(resStatus).toBe(403);
    expect(calledNext).toBe(false);
    expect(res.errors).toHaveLength(1);
  });

  test("check admin - failure - user is not admin", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    let resStatus = 500;
    let calledNext = false;
    let res = {};

    await accessManager.checkAdmin(
      {
        data: { username: "user" },
      },
      {
        status: (status) => {
          resStatus = status;
          return { json: (data) => (res = data) };
        },
      },
      () => {
        calledNext = true;
      }
    );

    expect(resStatus).toBe(403);
    expect(calledNext).toBe(false);
    expect(res.errors).toHaveLength(1);
  });

  test("check admin - failure - user not logged in", async () => {
    let resStatus = 200;
    let res = {};
    await accessManager.checkAdmin(
      { data: {} },
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

  test("remove user - success", async () => {
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(0);
    expect(dbManager.deleteUser).toHaveBeenCalledTimes(1);
    expect(adminService.removeAdmin).toHaveBeenCalledTimes(1);
  });

  test("remove user - failure - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("remove user - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("remove user - failure - exception", async () => {
    dbManager.deleteUser.mockRejectedValue(new Error("TypeError"));

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("find user by name - success - DB", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(0);
    expect(res.user.name).toBe("user");
  });

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

  test("find user by name - failure - exception", async () => {
    dbManager.findUserByName.mockRejectedValue(new Error("TypeError"));

    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(1);
  });

  test("find user by ID - success - DB", async () => {
    dbManager.findUserById.mockResolvedValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(0);
    expect(res.user.name).toBe("user");
  });

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

  test("find user by ID - failure - exception", async () => {
    dbManager.findUserById.mockRejectedValue(new Error("TypeError"));

    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(1);
  });

  test("verify token - success - no PKI", async () => {
    let called = false;
    await accessManager.verifySession(
      {
        data: {
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

  test("verify token - failure", async () => {
    let called = false;
    let resStatus = 200;
    let res = {};
    await accessManager.verifySession(
      {
        data: {},
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

  test("verify token - success - PKI", async () => {
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.authenticate.mockResolvedValue(true);
    securityConfig.usePKI = true;
    let called = false;

    await accessManager.verifySession(
      {
        data: {},
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);

    securityConfig.usePKI = false;
  });

  test("logout - success", async () => {
    let called = false;

    await accessManager.logout({
      username: "user",
      destroy: () => {
        called = true;
      },
    });

    expect(called).toBe(true);
  });

  test("register - success", async () => {
    dbManager.findUserByName.mockResolvedValue(null);
    dbManager.register.mockResolvedValue({
      userId: "id",
      errors: [],
    });

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe("id");
    expect(response.errors).toHaveLength(0);
  });

  test("register - failure - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.findUserByName.mockResolvedValue(null);

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe(null);
    expect(response.errors).toHaveLength(1);

    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
  });

  test("register - failure - user exists", async () => {
    dbManager.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
    });

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe(null);
    expect(response.errors).toHaveLength(1);
  });
});
