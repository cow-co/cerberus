const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const pki = require("../../security/pki");
const dbManager = require("../../security/database-manager");
const adminService = require("../../db/services/admin-service");
const implantService = require("../../db/services/implant-service");
const userService = require("../../db/services/user-service");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
let accessManager;

jest.mock("../../security/pki");
jest.mock("../../security/database-manager");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/services/implant-service");
jest.mock("../../db/services/user-service");
jest.mock("jsonwebtoken");
jest.mock("argon2");

// TODO Update all tests to use more appropriate Jest matchers (instead of just "toBe" everywhere)

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
    securityConfig.usePKI = false;
    argon2.hash.mockResolvedValue("hashed");
    argon2.verify.mockResolvedValue(true);
  });

  test("authenticate - success - no PKI", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: "hashed",
      acgs: [],
    });
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    let res;
    let called = false;

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

    expect(called).toBeTruthy();
    expect(res).toBeUndefined();
  });

  test("authenticate - failure - empty username", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: "hashed",
      acgs: [],
    });
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    let res;
    let called = false;

    await accessManager.authenticate(
      {
        body: {
          username: "",
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

    expect(called).toBeFalsy();
    expect(resStatus).toBe(401);
    expect(res.errors).toHaveLength(1);
  });

  // TODO Some helper functions to neaten up the tests
  test("authenticate - failure - no username", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: "hashed",
      acgs: [],
    });
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    let res;
    let called = false;

    await accessManager.authenticate(
      {
        body: {
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

    expect(called).toBeFalsy();
    expect(resStatus).toBe(401);
    expect(res.errors).toHaveLength(1);
  });

  test("authenticate - failure - user not found", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue(null);
    let res;
    let called = false;

    await accessManager.authenticate(
      {
        body: {
          username: "sss",
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

    expect(called).toBeFalsy();
    expect(resStatus).toBe(401);
    expect(res.errors).toHaveLength(1);
  });

  test("authenticate - failure - password wrong", async () => {
    argon2.verify.mockResolvedValue(false);
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: "hashed",
      acgs: [],
    });
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    let res;
    let called = false;

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

    expect(called).toBeFalsy();
    expect(resStatus).toBe(401);
    expect(res.errors).toHaveLength(1);
  });

  test("authenticate - success - PKI", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    jwt.sign.mockReturnValue("TEST");

    let called = false;
    await accessManager.authenticate({}, null, () => {
      called = true;
    });

    expect(called).toBeTruthy();
    expect(pki.extractUserDetails).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("authenticate - failure - PKI, user does not exist", async () => {
    securityConfig.usePKI = true;
    pki.extractUserDetails.mockReturnValue("user");
    userService.getUserAndPasswordByUsername.mockResolvedValue(null);

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
    expect(jwt.sign).toHaveBeenCalledTimes(0);
  });

  test("authenticate - failure - exception", async () => {
    userService.getUserAndPasswordByUsername.mockRejectedValue(
      new TypeError("TEST")
    );

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

  test("remove user - success", async () => {
    const errors = await accessManager.removeUser("userId");

    expect(errors).toHaveLength(0);
    expect(dbManager.deleteUser).toHaveBeenCalledTimes(1);
  });

  test("remove user - failure - exception", async () => {
    dbManager.deleteUser.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.removeUser("userId")
    ).rejects.toThrow(TypeError);
  });

  test("find user by name - success", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
      acgs: [],
    });

    const res = await accessManager.findUserByName("user");

    expect(res.name).toBe("user");
  });

  test("find user by name - failure - exception", async () => {
    dbManager.findUserByName.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.findUserByName("user")
    ).rejects.toThrow(TypeError);
  });

  test("find user by ID - success", async () => {
    dbManager.findUserById.mockResolvedValue({
      id: "id",
      name: "user",
    });

    const res = await accessManager.findUserById("userId");

    expect(res.errors).toHaveLength(0);
    expect(res.user.name).toBe("user");
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

  test("logout - success", async () => {
    await accessManager.logout("id");

    expect(dbManager.logout).toHaveBeenCalledTimes(1);
  });

  test("register - success", async () => {
    dbManager.findUserByName.mockResolvedValue({ id: "", name: "" });
    dbManager.register.mockResolvedValue({
      userId: "id",
      errors: [],
    });

    const response = await accessManager.register("user", "pass");

    expect(response._id).toBe("id");
    expect(response.errors).toHaveLength(0);
  });

  test("register - failure - user exists", async () => {
    dbManager.findUserByName.mockResolvedValue({
      id: "id",
      name: "user",
      acgs: [],
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

  test("Get user groups - success", async () => {
    dbManager.getGroupsForUser.mockResolvedValue(["read1", "operator2"]);

    const groups = await accessManager.getGroupsForUser("userId");

    expect(groups).toHaveLength(2);
  });

  test("Get user groups - failure - exception", async () => {
    dbManager.getGroupsForUser.mockRejectedValue(new TypeError("TEST"));

    expect(
      async () => await accessManager.getGroupsForUser("userId")
    ).rejects.toThrow(TypeError);
  });

  test("Delete group - success", async () => {
    dbManager.deleteGroup.mockResolvedValue({ _id: "id", name: "name" });

    const { deletedEntity, errors } = await accessManager.deleteGroup("id");

    expect(deletedEntity.name).toBe("name");
    expect(errors).toHaveLength(0);
  });

  test("Delete group - success - group did not exist", async () => {
    dbManager.deleteGroup.mockResolvedValue(null);

    const { deletedEntity, errors } = await accessManager.deleteGroup("id");

    expect(deletedEntity).toBe(null);
    expect(errors).toHaveLength(0);
  });

  test("Delete group - failure - no ID provided", async () => {
    const { deletedEntity, errors } = await accessManager.deleteGroup("");

    expect(deletedEntity).toBe(null);
    expect(errors).toHaveLength(1);
  });

  test("Delete group - failure - exception", async () => {
    dbManager.deleteGroup.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await accessManager.deleteGroup("id")).rejects.toThrow(
      TypeError
    );
  });

  test("create group - success", async () => {
    dbManager.createGroup.mockResolvedValue([]);

    const errors = await accessManager.createGroup("name");

    expect(errors).toHaveLength(0);
  });

  test("create group - failure - no name provided", async () => {
    const errors = await accessManager.createGroup("");

    expect(errors).toHaveLength(1);
  });

  test("create group - failure - exception gets thrown out", async () => {
    dbManager.createGroup.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await accessManager.createGroup("name")).rejects.toThrow(
      TypeError
    );
  });

  test("get all groups - success", async () => {
    dbManager.getAllGroups.mockResolvedValue([
      { _id: "a", name: "a" },
      { _id: "b", name: "b" },
    ]);

    const { errors, groups } = await accessManager.getAllGroups();

    expect(errors).toHaveLength(0);
    expect(groups).toHaveLength(2);
  });
});
