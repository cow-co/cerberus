let agent;
let server;
const { purgeCache } = require("../utils");

const User = require("../../db/models/User");
const accessManager = require("../../security/user-and-access-manager");
const adminService = require("../../db/services/admin-service");
const userService = require("../../db/services/user-service");
const argon2 = require("argon2");
const securityConfig = require("../../config/security-config");

jest.mock("../../security/user-and-access-manager");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/services/user-service");

describe("Access tests", () => {
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
    accessManager.verifySession.mockImplementation((req, res, next) => {
      next();
    });
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should create a user", async () => {
    accessManager.register.mockResolvedValue({
      _id: "some-mongo-id",
      errors: [],
    });

    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(200);
    expect(accessManager.register).toHaveBeenCalledTimes(1);
  });

  test("should fail to create a user - error occurred", async () => {
    accessManager.register.mockResolvedValue({
      _id: null,
      errors: ["ERROR"],
    });

    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(400);
  });

  test("should fail to create a user - exception thrown", async () => {
    accessManager.register.mockRejectedValue(new Error("TypeError"));

    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(500);
  });

  test("should log in", async () => {
    accessManager.authenticate.mockImplementation((req, res, next) => {
      next();
    });

    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(200);
    expect(accessManager.authenticate).toHaveBeenCalledTimes(1);
  });

  test("should log out", async () => {
    const res = await agent.delete("/api/access/logout");

    expect(res.statusCode).toBe(200);
    expect(accessManager.logout).toHaveBeenCalledTimes(1);
  });

  test("should fail to log out - exception thrown", async () => {
    accessManager.logout.mockRejectedValue(new Error("TypeError"));

    const res = await agent.delete("/api/access/logout");

    expect(res.statusCode).toBe(500);
  });

  test("should successfully add an admin", async () => {
    accessManager.checkAdmin.mockImplementation((req, res, next) => {
      next();
    });
    accessManager.findUserById.mockResolvedValue({
      user: {
        id: "650a3a2a7dcd3241ecee2d70",
      },
    });
    adminService.addAdmin.mockResolvedValue({
      userId: "650a3a2a7dcd3241ecee2d70",
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(200);
    expect(adminService.addAdmin).toHaveBeenCalledTimes(1);
  });

  test("should successfully remove an admin", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        id: "650a3a2a7dcd3241ecee2d70",
      },
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: false });

    expect(res.statusCode).toBe(200);
    expect(adminService.removeAdmin).toHaveBeenCalledTimes(1);
  });

  test("should fail to add an admin - user does not exist", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: null,
      errors: [],
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(400);
    expect(accessManager.findUserById).toHaveBeenCalledTimes(1);
  });

  test("should fail to add an admin - exception thrown", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        id: "650a3a2a7dcd3241ecee2d70",
      },
    });
    adminService.addAdmin.mockRejectedValue(new Error("TypeError"));

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(500);
  });
});
