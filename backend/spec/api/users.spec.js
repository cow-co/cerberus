let agent;
let server;
const { purgeCache } = require("../utils");

const accessManager = require("../../security/user-and-access-manager");
const adminService = require("../../db/services/admin-service");

jest.mock("../../security/user-and-access-manager");
jest.mock("../../db/services/admin-service");

describe("User tests", () => {
  afterEach(() => {
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    accessManager.verifyToken.mockImplementation((req, res, next) => {
      req.data = {
        username: "user",
        userId: "id",
      };
      next();
    });

    accessManager.checkAdmin.mockImplementation((req, res, next) => {
      next();
    });

    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("find user - success", async () => {
    accessManager.findUserByName.mockResolvedValue({
      user: {
        _id: "some-mongo-id3",
        name: "username",
        hashedPassword: "hashed",
      },
      errors: [],
    });

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("username");
  });

  test("find user - failure - exception", async () => {
    accessManager.findUserByName.mockRejectedValue(new Error("TypeError"));

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("get user - does not include password hash", async () => {
    accessManager.findUserByName.mockResolvedValue({
      user: {
        _id: "some-mongo-id3",
        name: "username",
        hashedPassword: "hashed",
      },
      errors: [],
    });

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.hashedPassword).toBe(undefined);
  });

  test("delete user - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        _id: "some-mongo-id3",
        name: "username",
        hashedPassword: "hashed",
      },
      errors: [],
    });
    accessManager.removeUser.mockResolvedValue([]);

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(200);
    expect(accessManager.removeUser).toHaveBeenCalledTimes(1);
  });

  test("delete user - failure - error", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        _id: "some-mongo-id3",
        name: "username",
        hashedPassword: "hashed",
      },
      errors: [],
    });
    accessManager.removeUser.mockResolvedValue(["error"]);

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("delete user - failure - exception", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        _id: "some-mongo-id3",
        name: "username",
        hashedPassword: "hashed",
      },
      errors: [],
    });
    accessManager.removeUser.mockRejectedValue(new Error("TypeError"));

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("delete user - success - user does not exist", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: null,
      errors: [],
    });

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(200);
  });

  test("whoami - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: { _id: "id", name: "user" },
      errors: [],
    });
    adminService.isUserAdmin.mockResolvedValue(false);
    const res = await agent.get("/api/users/whoami");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("user");
    expect(res.body.user.isAdmin).toBe(false);
  });
});
