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
    accessManager.authZCheck.mockResolvedValue(true);

    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("get user - success", async () => {
    accessManager.findUserByName.mockResolvedValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("username");
  });

  test("get user - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(403);
  });

  test("get user - failure - exception", async () => {
    accessManager.findUserByName.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("get user - success - does not include password hash", async () => {
    accessManager.findUserByName.mockResolvedValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });

    const res = await agent.get("/api/users/user/username");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.hashedPassword).toBe(undefined);
  });

  test("delete user - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    accessManager.removeUser.mockResolvedValue([]);

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(200);
    expect(accessManager.removeUser).toHaveBeenCalledTimes(1);
  });

  test("delete user - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(403);
    expect(accessManager.removeUser).toHaveBeenCalledTimes(0);
  });

  test("delete user - failure - exception", async () => {
    accessManager.findUserById.mockResolvedValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    accessManager.removeUser.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("delete user - success - user does not exist", async () => {
    accessManager.findUserById.mockResolvedValue({
      _id: "",
      name: "",
      acgs: [],
    });
    accessManager.removeUser.mockResolvedValue([]);

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(200);
  });

  test("whoami - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      _id: "id",
      name: "user",
    });
    adminService.isUserAdmin.mockResolvedValue(false);

    const res = await agent.get("/api/users/whoami");

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("user");
    expect(res.body.user.isAdmin).toBeFalsy();
  });

  test("whoami - failure - exception", async () => {
    accessManager.findUserById.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.get("/api/users/whoami");

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });

  test("get user's groups - success", async () => {
    accessManager.getGroupsForUser.mockResolvedValue({
      groups: ["group 1", "group 2"],
      errors: [],
    });

    const res = await agent.get("/api/users/user/id/groups");

    expect(res.statusCode).toBe(200);
    expect(res.body.groups).toHaveLength(2);
    expect(res.body.errors).toHaveLength(0);
  });

  test("get user's groups - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent.get("/api/users/user/id/groups");

    expect(res.statusCode).toBe(403);
    expect(res.body.groups).toHaveLength(0);
    expect(res.body.errors).toHaveLength(1);
  });

  test("get user's groups - failure - exception", async () => {
    accessManager.getGroupsForUser.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.get("/api/users/user/id/groups");

    expect(res.statusCode).toBe(500);
    expect(res.body.groups).toHaveLength(0);
    expect(res.body.errors).toHaveLength(1);
  });

  test("update user's groups - success", async () => {
    const res = await agent
      .post("/api/users/user/id/groups")
      .send({ groups: ["test"] });

    expect(res.statusCode).toBe(200);
  });

  test("update user's groups - failure - forbidden", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent
      .post("/api/users/user/id/groups")
      .send({ groups: ["test"] });

    expect(res.statusCode).toBe(403);
  });

  test("update user's groups - failure - exception", async () => {
    accessManager.editUserGroups.mockRejectedValue(new TypeError("TEST"));

    const res = await agent
      .post("/api/users/user/id/groups")
      .send({ groups: ["test"] });

    expect(res.statusCode).toBe(500);
  });

  test("update user's password - success", async () => {
    accessManager.findUserById.mockResolvedValue({ _id: "id", name: "name" });
    accessManager.changePassword.mockResolvedValue([]);

    const res = await agent
      .post("/api/users/user")
      .send({ oldPassword: "old", password: "pass", confirmPassword: "pass" });

    expect(res.statusCode).toBe(200);
  });

  test("update user's password - failure - validation error", async () => {
    accessManager.findUserById.mockResolvedValue({ _id: "id", name: "name" });
    accessManager.changePassword.mockResolvedValue(["TEST"]);

    const res = await agent
      .post("/api/users/user")
      .send({ oldPassword: "old", password: "pass", confirmPassword: "pass" });

    expect(res.statusCode).toBe(400);
  });

  test("update user's password - failure - not authorised", async () => {
    accessManager.findUserById.mockResolvedValue({ _id: "id", name: "name" });
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent
      .post("/api/users/user")
      .send({ oldPassword: "old", password: "pass", confirmPassword: "pass" });

    expect(res.statusCode).toBe(403);
  });

  test("update user's password - failure - exception", async () => {
    accessManager.findUserById.mockResolvedValue({ _id: "id", name: "name" });
    accessManager.changePassword.mockRejectedValue(new TypeError("TEST"));

    const res = await agent
      .post("/api/users/user")
      .send({ oldPassword: "old", password: "pass", confirmPassword: "pass" });

    expect(res.statusCode).toBe(500);
  });
});
