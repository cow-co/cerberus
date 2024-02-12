const securityConfig = require("../../config/security-config");
const { purgeCache } = require("../utils");
const adminService = require("../../db/services/admin-service");
const implantService = require("../../db/services/implant-service");
const userService = require("../../db/services/user-service");
const acgService = require("../../db/services/acg-service");
const validation = require("../../validation/security-validation");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const HashedPassword = require("../../db/models/HashedPassword");
let accessManager;

jest.mock("../../db/services/admin-service");
jest.mock("../../db/services/implant-service");
jest.mock("../../db/services/user-service");
jest.mock("../../db/services/acg-service");
jest.mock("../../validation/security-validation");
jest.mock("../../db/models/HashedPassword");
jest.mock("jsonwebtoken");
jest.mock("argon2");

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
    validation.validatePassword.mockReturnValue([]);
    validation.validateUsername.mockReturnValue([]);
  });

  test("pki user extraction - success", async () => {
    securityConfig.usePKI = true;
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "user",
      password: "hashed",
      acgs: [],
    });

    let called = false;
    await accessManager.authenticate(
      {
        client: { authorized: true },
        socket: {
          getPeerCertificate: () => {
            return { subject: { CN: "user" } };
          },
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
  });

  test("pki user extraction - failure - untrusted cert", async () => {
    securityConfig.usePKI = true;

    let called = false;
    let resStatus = 200;
    await accessManager.authenticate(
      {
        client: { authorized: false },
        socket: {
          getPeerCertificate: () => {
            return { subject: { CN: "user" } };
          },
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
  });

  test("authenticate - success - no PKI", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: {
        _id: "id",
        hashedPassword: "hashed",
      },
      acgs: [],
    });
    userService.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
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
      password: {
        _id: "id",
        hashedPassword: "hashed",
      },
      acgs: [],
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

  test("authenticate - failure - no username", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      name: "ksdah",
      password: {
        _id: "id",
        hashedPassword: "hashed",
      },
      acgs: [],
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
      password: {
        _id: "id",
        hashedPassword: "hashed",
      },
      acgs: [],
    });
    userService.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
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
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      _id: "id",
      name: "user",
      password: null,
      acgs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    jwt.sign.mockReturnValue("TEST");

    let called = false;
    await accessManager.authenticate(
      {
        client: { authorized: true },
        socket: {
          getPeerCertificate: () => {
            return { subject: { CN: "user" } };
          },
        },
      },
      null,
      () => {
        called = true;
      }
    );

    expect(called).toBeTruthy();
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("authenticate - failure - PKI, user does not exist", async () => {
    securityConfig.usePKI = true;
    userService.getUserAndPasswordByUsername.mockResolvedValue(null);

    let called = false;
    let stat = 200;
    await accessManager.authenticate(
      {
        client: { authorized: true },
        socket: {
          getPeerCertificate: () => {
            return { subject: { CN: "user" } };
          },
        },
      },
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

    expect(called).toBeTruthy();
    expect(stat).toBe(401);
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

    expect(called).toBeFalsy();
    expect(resStatus).toBe(500);
    expect(res.errors).toHaveLength(1);
  });

  test("remove user - failure - exception", async () => {
    userService.deleteUser.mockRejectedValue(new TypeError("TEST"));
    expect(
      async () => await accessManager.removeUser("userId")
    ).rejects.toThrow(TypeError);
  });

  test("find user by name - success", async () => {
    userService.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });
    const res = await accessManager.findUserByName("user");

    expect(res.name).toBe("user");
    expect(res.password).toBeUndefined();
  });

  test("find user by name - failure - exception", async () => {
    userService.findUserByName.mockRejectedValue(new TypeError("TEST"));
    expect(
      async () => await accessManager.findUserByName("user")
    ).rejects.toThrow(TypeError);
  });

  test("find user by ID - success", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const res = await accessManager.findUserById("userId");

    expect(res.name).toBe("user");
  });

  test("find user by ID - failure - exception", async () => {
    userService.findUserById.mockRejectedValue(new TypeError("TEST"));
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

    expect(called).toBeTruthy();
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

    expect(called).toBeTruthy();
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

    expect(called).toBeTruthy();
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

    expect(called).toBeTruthy();
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

    expect(called).toBeFalsy();
    expect(res.errors).toHaveLength(1);
    expect(resStatus).toBe(403);
  });

  test("logout - success", async () => {
    await accessManager.logout("id");
    expect(userService.generateTokenValidityEntry).toHaveBeenCalledTimes(1);
  });

  test("register - success", async () => {
    userService.findUserByName.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const response = await accessManager.register("user", "pass", "pass");

    expect(response.userId).toBe("id");
    expect(response.errors).toHaveLength(0);
  });

  test("register - success - PKI", async () => {
    securityConfig.usePKI = true;
    userService.findUserByName.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const response = await accessManager.register("user", undefined, undefined);

    expect(response.userId).toBe("id");
    expect(response.errors).toHaveLength(0);
  });

  test("register - failure - user already exists with PKI", async () => {
    securityConfig.usePKI = true;
    userService.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const response = await accessManager.register("user", undefined, undefined);

    expect(response.userId).toBe(null);
    expect(response.errors).toHaveLength(1);
  });

  test("register - failure - validation errors", async () => {
    userService.findUserByName.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });
    validation.validatePassword.mockReturnValue(["TEST"]);

    const response = await accessManager.register("user", "pass", "notpass");

    expect(response.userId).toBeNull();
    expect(response.errors).toHaveLength(1);
  });

  test("register - failure - user exists", async () => {
    userService.findUserByName.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const response = await accessManager.register("user", "pass", "pass");

    expect(response.userId).toBeNull();
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

    const operation = {
      userId: "id",
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.READ,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - edit, admin", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(true);

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - read, no ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);

    const operation = {
      userId: "id",
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.READ,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - read, read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read", "read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.READ,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - read, operator (no read-only) ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["operator", "read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.READ,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - edit, no ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read", "read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - success - edit, operator ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: [],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["operator", "read"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - failure - read, read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.READ,
      accessControlType: accessManager.accessControlType.READ,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeFalsy();
  });

  test("User authorisation - failure - edit, only read-only ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read", "read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeFalsy();
  });

  test("User authorisation - failure - edit, operator ACGs", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: ["operator"],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read", "read2"],
    });

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.IMPLANT,
      entityId: "implant",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeFalsy();
  });

  test("User authorisation - failure - throws exception out", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "implant_id",
      id: "implant",
      readOnlyACGs: ["read"],
      operatorACGs: [],
    });
    adminService.isUserAdmin.mockRejectedValue(new TypeError("TEST"));

    expect(async () => {
      const operation = {
        userId: "id",
        type: accessManager.operationType.EDIT,
        accessControlType: accessManager.accessControlType.EDIT,
      };
      const target = {
        entityType: accessManager.targetEntityType.IMPLANT,
        entityId: "implant",
      };
      await accessManager.authZCheck(operation, target);
    }).rejects.toThrow(TypeError);
  });

  test("User authorisation - success - operation is on a user entity", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: accessManager.targetEntityType.USER,
      entityId: "id",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeTruthy();
  });

  test("User authorisation - failure - invalid entity type", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);

    const operation = {
      userId: "id",
      type: accessManager.operationType.EDIT,
      accessControlType: accessManager.accessControlType.EDIT,
    };
    const target = {
      entityType: "FAKE",
      entityId: "id",
    };
    const isPermitted = await accessManager.authZCheck(operation, target);

    expect(isPermitted).toBeFalsy();
  });

  test("Implant view filtering - success - admin", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });
    adminService.isUserAdmin.mockResolvedValue(true);

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(5);
  });

  test("Implant view filtering - success - read access to two implants", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read1", "read2"],
    });

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(4); // 1, 2, 3, 5
  });

  test("Implant view filtering - success - operator access to one implant", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["operator1"],
    });

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(3); // 1, 3, and 5
  });

  test("Implant view filtering - success - operator access to some, read on others", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["operator2", "read1"],
    });

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(4); // 1, 2, 3, and 5
  });

  test("Implant view filtering - success - user has no groups, can view no-(read-)ACG implants", async () => {
    adminService.isUserAdmin.mockResolvedValue(false);
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: [],
    });

    const { filtered } = await accessManager.filterImplantsForView(
      implantSearchResults,
      "userId"
    );

    expect(filtered).toHaveLength(2); // 3 and 5
  });

  test("Implant view filtering - failure - exception", async () => {
    adminService.isUserAdmin.mockRejectedValue(new TypeError("TEST"));
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read", "read2"],
    });

    expect(
      async () =>
        await accessManager.filterImplantsForView(
          implantSearchResults,
          "userId"
        )
    ).rejects.toThrow(TypeError);
  });

  test("Get user groups - success", async () => {
    userService.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
      password: "passId",
      acgs: ["read1", "operator2"],
    });
    const groups = await accessManager.getGroupsForUser("userId");

    expect(groups).toHaveLength(2);
  });

  test("Get user groups - failure - exception", async () => {
    userService.findUserById.mockRejectedValue(new TypeError("TEST"));
    expect(
      async () => await accessManager.getGroupsForUser("userId")
    ).rejects.toThrow(TypeError);
  });

  test("Delete group - success", async () => {
    acgService.deleteACG.mockResolvedValue({ _id: "id", name: "name" });

    const { deletedEntity, errors } = await accessManager.deleteGroup("id");

    expect(deletedEntity.name).toBe("name");
    expect(errors).toHaveLength(0);
  });

  test("Delete group - success - group did not exist", async () => {
    acgService.deleteACG.mockResolvedValue(null);
    const { deletedEntity, errors } = await accessManager.deleteGroup("id");

    expect(deletedEntity).toBeNull();
    expect(errors).toHaveLength(0);
  });

  test("Delete group - failure - no ID provided", async () => {
    const { deletedEntity, errors } = await accessManager.deleteGroup("");

    expect(deletedEntity).toBeNull();
    expect(errors).toHaveLength(1);
  });

  test("Delete group - failure - exception", async () => {
    acgService.deleteACG.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await accessManager.deleteGroup("id")).rejects.toThrow(
      TypeError
    );
  });

  test("create group - success", async () => {
    acgService.createACG.mockResolvedValue({ _id: "id", name: "name" });

    const errors = await accessManager.createGroup("name");

    expect(errors).toHaveLength(0);
  });

  test("create group - failure - no name provided", async () => {
    acgService.createACG.mockResolvedValue(null);

    const errors = await accessManager.createGroup("");

    expect(errors).toHaveLength(1);
  });

  test("create group - failure - exception gets thrown out", async () => {
    acgService.createACG.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await accessManager.createGroup("name")).rejects.toThrow(
      TypeError
    );
  });

  test("get all groups - success", async () => {
    acgService.getAllACGs.mockResolvedValue([
      { _id: "a", name: "a" },
      { _id: "b", name: "b" },
    ]);
    const { errors, acgs } = await accessManager.getAllGroups();

    expect(errors).toHaveLength(0);
    expect(acgs).toHaveLength(2);
  });

  test("change password - success", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      id: "id",
      name: "name",
      password: {
        hashedPassword: "hashed",
      },
    });
    validation.validatePassword.mockReturnValue([]);
    userService.findUserByName.mockResolvedValue({
      id: "id",
      name: "name",
      save: async () => {},
    });
    argon2.verify.mockResolvedValue(true);
    argon2.hash.mockResolvedValue("hashydooey8282");
    HashedPassword.create.mockResolvedValue({
      _id: "id",
      hashedPassword: "hashydooey8282",
    });

    const errors = await accessManager.changePassword(
      "name",
      "old",
      "pass",
      "pass"
    );

    expect(errors).toHaveLength(0);
  });

  test("change password - failure - validation error", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      id: "id",
      name: "name",
      password: {
        hashedPassword: "hashed",
      },
    });
    argon2.verify.mockResolvedValue(true);
    validation.validatePassword.mockReturnValue(["TEST"]);

    const errors = await accessManager.changePassword(
      "name",
      "old",
      "pass",
      "pass"
    );

    expect(errors).toHaveLength(1);
  });

  test("change password - failure - authentication error", async () => {
    userService.getUserAndPasswordByUsername.mockResolvedValue({
      id: "id",
      name: "name",
      password: {
        hashedPassword: "hashed",
      },
    });
    argon2.verify.mockResolvedValue(false);

    const errors = await accessManager.changePassword(
      "name",
      "old",
      "pass",
      "pass"
    );

    expect(errors).toHaveLength(1);
  });
});
