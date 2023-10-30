let agent;
let server;
const { purgeCache } = require("../utils");

const accessManager = require("../../security/user-and-access-manager");

jest.mock("../../security/user-and-access-manager");

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
    accessManager.verifySession.mockImplementation((req, res, next) => {
      req.session.username = "user";
      next();
    });

    accessManager.checkAdmin.mockImplementation((req, res, next) => {
      next();
    });

    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should find a user", async () => {
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

  test("should remove hashed password from user in response", async () => {
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

  test("should delete a user", async () => {
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

  test("should return success when deleting a user that does not exist", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: null,
      errors: [],
    });

    const res = await agent.delete("/api/users/user/some-mongo-id3");

    expect(res.statusCode).toBe(200);
  });

  test("should check session and return username", async () => {
    const res = await agent.get("/api/users/check-session");

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("user");
  });
});
