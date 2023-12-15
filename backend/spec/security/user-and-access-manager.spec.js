const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const pki = require("../../security/pki");
const dbManager = require("../../security/database-manager");
const adManager = require("../../security/active-directory-manager");
const adminService = require("../../db/services/admin-service");
const implantService = require("../../db/services/implant-service");
const userService = require("../../db/services/user-service");
const jwt = require("jsonwebtoken");
let accessManager;

jest.mock("../../security/pki");
jest.mock("../../security/database-manager");
jest.mock("../../security/active-directory-manager");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/services/implant-service");
jest.mock("../../db/services/user-service");
jest.mock("jsonwebtoken");

const implantSearchResults = [
  {
    _id: "id1",
    id: "implant1",
    readOnlyACGs: ["read1"],
    operatorACGs: ["operator1"],
  },
  {
    _id: "id2",
    id: "implant2",
    readOnlyACGs: ["read1", "read2"],
    operatorACGs: ["operator2"],
  },
  {
    _id: "id3",
    id: "implant3",
    readOnlyACGs: [],
    operatorACGs: [],
  },
  {
    _id: "id4",
    id: "implant4",
    readOnlyACGs: ["read4"],
    operatorACGs: [],
  },
  {
    _id: "id5",
    id: "implant5",
    readOnlyACGs: [],
    operatorACGs: ["operator5"],
  },
];

describe("Access Manager tests", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeAll(() => {
    accessManager = require("../../security/user-and-access-manager");
  });

  beforeEach(() => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.DB;
    securityConfig.usePKI = false;
  });

  test("authenticate - success - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.authenticate.mockResolvedValue(true);
    adManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);

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
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("authenticate - success - PKI", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.authenticate.mockResolvedValue(true);
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);

    let called = false;
    await accessManager.authenticate({}, null, () => {
      called = true;
    });

    expect(called).toBe(true);
    expect(pki.extractUserDetails).toHaveBeenCalledTimes(1);
    expect(dbManager.authenticate).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("authenticate - failure - user somehow deleted between creds check and ", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.authenticate.mockResolvedValue(true);
    adManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);

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
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("authenticate - failure - PKI, user does not exist", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.authenticate.mockResolvedValue(false);

    let called = false;
    let stat = 200;
    await accessManager.authenticate(
      {},
      {
        status: (status) => {
          stat = status;
          return {
            json: (data) => {
              called = true;
            },
          };
        },
      },
      () => {}
    );

    expect(called).toBe(true);
    expect(stat).toBe(401);
    expect(pki.extractUserDetails).toHaveBeenCalledTimes(1);
    expect(dbManager.authenticate).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledTimes(0);
  });

  test("authenticate - failure - exception", async () => {
    dbManager.authenticate.mockRejectedValue(new TypeError("TEST"));

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

  test("remove user - success", async () => {
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(0);
    expect(dbManager.deleteUser).toHaveBeenCalledTimes(1);
  });

  test("remove user - failure - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("remove user - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";

    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(1);
  });

  test("remove user - failure - exception", async () => {
    dbManager.deleteUser.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.removeUser("userId")
    ).rejects.toThrow(TypeError);
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
  });

  test("find user by name - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserByName("user");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toEqual({ id: "", name: "" });
  });

  test("find user by name - failure - exception", async () => {
    dbManager.findUserByName.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.findUserByName("user")
    ).rejects.toThrow(TypeError);
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
  });

  test("find user by ID - failure - unsupported auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(1);
    expect(res.user).toEqual({ id: "", name: "" });
  });

  test("find user by ID - failure - exception", async () => {
    dbManager.findUserById.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.findUserById("userId")
    ).rejects.toThrow(TypeError);
  });

  test("verify token - success - no PKI", async () => {
    let called = false;
    userService.getMinTokenTimestamp.mockResolvedValue(0);
    jwt.verify.mockReturnValue({ userId: "id", iat: Date.now() });

    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer aaabbbccc",
        },
        headerString: function (header) {
          return this.headers[header];
        },
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(userService.getMinTokenTimestamp).toHaveBeenCalledTimes(1);
  });

  test("verify token - failure - invalidated token", async () => {
    let called = false;
    let httpStatus = 200;
    userService.getMinTokenTimestamp.mockResolvedValue(Number.MAX_SAFE_INTEGER);
    jwt.verify.mockReturnValue({ userId: "id", iat: Date.now() });

    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer aaabbbccc",
        },
        headerString: function (header) {
          return this.headers[header];
        },
      },
      {
        status: (statusCode) => {
          httpStatus = statusCode;
          return {
            json: (data) => {
              called = true;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(userService.getMinTokenTimestamp).toHaveBeenCalledTimes(1);
    expect(httpStatus).toBe(403);
  });

  test("verify token - failure - exception", async () => {
    let called = false;
    let httpStatus = 200;
    userService.getMinTokenTimestamp.mockRejectedValue(new TypeError("TEST"));
    jwt.verify.mockReturnValue({ userId: "id", iat: Date.now() });

    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer aaabbbccc",
        },
        headerString: function (header) {
          return this.headers[header];
        },
      },
      {
        status: (statusCode) => {
          httpStatus = statusCode;
          return {
            json: (data) => {
              called = true;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(userService.getMinTokenTimestamp).toHaveBeenCalledTimes(1);
    expect(httpStatus).toBe(500);
  });

  test("verify token - failure - JWT exception", async () => {
    let called = false;
    let httpStatus = 200;
    jwt.verify.mockImplementation((token, secret) => {
      let error = new Error("TEST");
      error.name = "JsonWebTokenError";
      throw error;
    });

    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer aaabbbccc",
        },
        headerString: function (header) {
          return this.headers[header];
        },
      },
      {
        status: (statusCode) => {
          httpStatus = statusCode;
          return {
            json: (data) => {
              called = true;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(userService.getMinTokenTimestamp).toHaveBeenCalledTimes(0);
    expect(httpStatus).toBe(403);
  });

  test("verify token - failure", async () => {
    let called = false;
    let resStatus = 200;
    let res = {};
    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
        },
        headerString: function (header) {
          return this.headers[header];
        },
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
    dbManager.findUserByName.mockResolvedValue({
      user: {
        id: "id",
        name: "user",
      },
      errors: [],
    });
    dbManager.authenticate.mockResolvedValue(true);
    securityConfig.usePKI = true;
    let called = false;

    await accessManager.verifyToken(
      {
        headers: {
          "content-type": "application/json",
        },
        headerString: function (header) {
          return this.headers[header];
        },
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBe(true);
  });

  test("logout - success", async () => {
    await accessManager.logout("id");

    expect(dbManager.logout).toHaveBeenCalledTimes(1);
  });

  test("logout - success - AD", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;

    await accessManager.logout("id");

    expect(adManager.logout).toHaveBeenCalledTimes(1);
  });

  test("register - success", async () => {
    dbManager.findUserByName.mockResolvedValue({id: "", name: ""});
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
    adManager.findUserByName.mockResolvedValue({id: "", name: ""});

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe(null);
    expect(response.errors).toHaveLength(1);
  });

  test("register - failure - user exists", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
      acgs: []
    });

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe(null);
    expect(response.errors).toHaveLength(1);
  });

  test("User authorisation - success - read, admin", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(true);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.READ,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - edit, admin", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(true);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - read, no ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.READ,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - read, read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read", "read2"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.READ,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - read, operator (no read-only) ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["operator", "read2"]);
    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.READ,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - edit, no ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read", "read2"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - success - edit, operator ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read", "operator"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - failure - read, read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read2"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.READ,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.READ,
      "id"
    );

    expect(isPermitted).toBe(false);
  });

  test("User authorisation - failure - edit, only read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read", "read2"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(false);
  });

  test("User authorisation - failure - edit, operator ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    dbManager.getGroupsForUser.mockResolvedValue(["read", "read2"]);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.IMPLANT,
      "implant",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(false);
  });

  test("User authorisation - failure - throws exception out", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () =>
        await accessManager.authZCheck(
          accessManager.operationType.EDIT,
          accessManager.targetEntityType.IMPLANT,
          "implant",
          accessManager.accessControlType.EDIT,
          "id"
        )
    ).rejects.toThrow(TypeError);
  });

  test("User authorisation - success - operation is on a user entity", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      accessManager.targetEntityType.USER,
      "id",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(true);
  });

  test("User authorisation - failure - invalid entity type", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);

    const isPermitted = await accessManager.authZCheck(
      accessManager.operationType.EDIT,
      "FAKE",
      "id",
      accessManager.accessControlType.EDIT,
      "id"
    );

    expect(isPermitted).toBe(false);
  });

  test("Implant view filtering - success - admin", async () => {
    dbManager.getGroupsForUser.mockResolvedValue([]);
    adminService.isUserAdmin.mockResolvedValue(true);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(5);
  });

  test("Implant view filtering - success - read access to two implants", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["read1", "read2"]);
    adminService.isUserAdmin.mockResolvedValue(false);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(4); // 1, 2, 3, 5
  });

  test("Implant view filtering - success - operator access to one implant", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["operator1"]);
    adminService.isUserAdmin.mockResolvedValue(false);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(3); // 1, 3, and 5
  });

  test("Implant view filtering - success - operator access to some, read on others", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["read1", "operator2"]);
    adminService.isUserAdmin.mockResolvedValue(false);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(4); // 1, 2, 3, and 5
  });

  test("Implant view filtering - success - user has no groups, can view no-(read-)ACG implants", async () => {
    dbManager.getGroupsForUser.mockResolvedValue([]);
    adminService.isUserAdmin.mockResolvedValue(false);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(2); // 3 and 5
  });

  test("Implant view filtering - failure - exception", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["read", "read2"]);
    adminService.isUserAdmin.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () =>
        await accessManager.filterImplantsForView(
          implantSearchResults,
          "userId"
        )
    ).rejects.toThrow(TypeError);
  });

  test("Implant view filtering - failure - errors in the get groups function", async () => {
    securityConfig.authMethod = "FAKE";
    adminService.isUserAdmin.mockResolvedValue(false);

    const { filtered, errors } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });

  test("Get user groups - success - DB Backed", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["read1", "operator2"]);

    const { groups, errors } = await accessManager.getGroupsForUser("userId");

    expect(groups).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  test("Get user groups - success - AD Backed", async () => {
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    adManager.getGroupsForUser.mockResolvedValue(["read1", "operator2"]);

    const { groups, errors } = await accessManager.getGroupsForUser("userId");

    expect(groups).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  test("Get user groups - failure - Fake auth method", async () => {
    securityConfig.authMethod = "FAKE";
    const { groups, errors } = await accessManager.getGroupsForUser("userId");

    expect(groups).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });

  test("Get user groups - failure - exception", async () => {
    dbManager.getGroupsForUser.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.getGroupsForUser("userId")
    ).rejects.toThrow(TypeError);
  });
});
