let agent;
let server;
const { purgeCache } = require("../utils");

const accessManager = require("../../security/user-and-access-manager");
const adminService = require("../../db/services/admin-service");
const implantService = require("../../db/services/implant-service");

jest.mock("../../security/user-and-access-manager");
jest.mock("../../db/services/admin-service");
jest.mock("../../db/services/user-service");
jest.mock("../../db/services/implant-service");

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
    accessManager.verifyToken.mockImplementation((req, res, next) => {
      req.data = {};
      req.data.userId = "id";
      req.data.username = "user";
      req.data.isAdmin = false;
      next();
    });
    accessManager.authZCheck.mockResolvedValue(true);
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("create user - success", async () => {
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

  test("create user - success - sanitisation applied to username", async () => {
    accessManager.register.mockResolvedValue({
      _id: "some-mongo-id",
      errors: [],
    });

    const res = await agent
      .post("/api/access/register")
      .send({ username: true, password: "abcdefghijklmnopqrstuvwxyZ11" });

    const args = accessManager.register.mock.calls[0];
    expect(res.statusCode).toBe(200);
    expect(accessManager.register).toHaveBeenCalledTimes(1);
    expect(args[0]).toBe("true");
    expect(typeof args[0]).toBe("string");
  });

  test("create user - success - sanitisation applied to password", async () => {
    accessManager.register.mockResolvedValue({
      _id: "some-mongo-id",
      errors: [],
    });

    const res = await agent.post("/api/access/register").send({
      username: "user",
      password: 111,
    });

    const args = accessManager.register.mock.calls[0];
    expect(res.statusCode).toBe(200);
    expect(accessManager.register).toHaveBeenCalledTimes(1);
    expect(args[1]).toBe("111");
    expect(typeof args[1]).toBe("string");
  });

  test("create user - failure - error occurred", async () => {
    accessManager.register.mockResolvedValue({
      _id: null,
      errors: ["ERROR"],
    });

    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(400);
  });

  test("create user - failure - exception thrown", async () => {
    accessManager.register.mockRejectedValue(new TypeError("TEST"));

    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(500);
  });

  test("login - success", async () => {
    accessManager.findUserByName.mockResolvedValue({
      user: {
        id: "id",
        name: "user",
      },
      errors: [],
    });
    accessManager.authenticate.mockImplementation(async (req, res, next) => {
      req.data = {
        token: "token",
        userId: "id",
        username: "user",
        isAdmin: false,
      };

      next();
    });

    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });

    expect(res.statusCode).toBe(200);
    expect(accessManager.authenticate).toHaveBeenCalledTimes(1);
    expect(res.body.token).toBe("token");
  });

  test("logout - success", async () => {
    const res = await agent.delete("/api/access/logout/id");

    expect(res.statusCode).toBe(200);
    expect(accessManager.logout).toHaveBeenCalledTimes(1);
  });

  test("logout - failure - logging a different user out", async () => {
    const res = await agent.delete("/api/access/logout/id2");

    expect(res.statusCode).toBe(403);
    expect(accessManager.logout).toHaveBeenCalledTimes(0);
  });

  test("logout - failure - exception thrown", async () => {
    accessManager.logout.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.delete("/api/access/logout/id");

    expect(res.statusCode).toBe(500);
  });

  test("add admin - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        id: "650a3a2a7dcd3241ecee2d70",
      },
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(200);
    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(1);
  });

  test("remove admin - success", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: {
        id: "650a3a2a7dcd3241ecee2d70",
      },
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: false });

    expect(res.statusCode).toBe(200);
    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(1);
  });

  test("add admin - failure - user does not exist", async () => {
    accessManager.findUserById.mockResolvedValue({
      user: null,
      errors: [],
    });

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(400);
    expect(accessManager.findUserById).toHaveBeenCalledTimes(1);
    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(0);
  });

  test("add admin - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(403);
    expect(accessManager.findUserById).toHaveBeenCalledTimes(0);
    expect(adminService.changeAdminStatus).toHaveBeenCalledTimes(0);
  });

  test("add admin - failure - exception thrown", async () => {
    accessManager.findUserById.mockRejectedValue(new TypeError("TEST"));

    const res = await agent
      .put("/api/access/admin")
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).toBe(500);
  });

  test("update implant ACGs - success", async () => {
    implantService.updateACGs.mockResolvedValue({
      _id: "id",
      id: "implantId",
      readOnlyACGs: ["group1"],
      operatorACGs: ["group2"],
    });

    const res = await agent
      .post("/api/access/implants/implantId/acgs")
      .send({ readOnlyACGs: ["group1"], operatorACGs: ["group2"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.implant.readOnlyACGs).toHaveLength(1);
    expect(res.body.implant.operatorACGs).toHaveLength(1);
  });

  test("update implant ACGs - failure - not found", async () => {
    implantService.updateACGs.mockResolvedValue(null);

    const res = await agent
      .post("/api/access/implants/implantId/acgs")
      .send({ readOnlyACGs: ["group1"], operatorACGs: ["group2"] });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toHaveLength(1);
  });

  test("update implant ACGs - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent
      .post("/api/access/implants/implantId/acgs")
      .send({ readOnlyACGs: ["group1"], operatorACGs: ["group2"] });

    expect(res.statusCode).toBe(403);
    expect(res.body.errors).toHaveLength(1);
  });

  test("update implant ACGs - failure - exception", async () => {
    implantService.updateACGs.mockRejectedValue(new TypeError("TEST"));

    const res = await agent
      .post("/api/access/implants/implantId/acgs")
      .send({ readOnlyACGs: ["group1"], operatorACGs: ["group2"] });

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
  });
});
