let agent;
let server;
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");
const accessManager = require("../../security/user-and-access-manager");
const argon2 = require("argon2");
const securityConfig = require("../../config/security-config");
const pki = require("../../security/pki");
const ActiveDirectory = require("activedirectory");
const Task = require("../../db/models/Task");
const Admin = require("../../db/models/Admin");

// TODO refactor to stub out-of-module calls
describe("Access tests", () => {
  afterEach(() => {
    sinon.restore();
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    spyOn(accessManager, "verifySession").and.callFake((req, res, next) => {
      next();
    });
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  it("should create a user", async () => {
    const userSpy = spyOn(User, "create").and.returnValue({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
    expect(userSpy.calls.count()).to.equal(1);
  });

  it("should fail to create a user - exception thrown", async () => {
    spyOn(accessManager, "register").and.throwError("TypeError");
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(500);
  });

  it("should fail to create a user - AD-backed", async () => {
    const originalSetting = securityConfig.authMethod;
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(400);
    securityConfig.authMethod = originalSetting;
  });

  it("should fail to create a user - no uppercase", async () => {
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyz11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no lowercase", async () => {
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "ABCDEFGHIJKLMNOPQRSTUVWXYZ11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no number", async () => {
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - too short", async () => {
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "Ab1" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should log in", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(true);
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
    expect(res.headers["set-cookie"]).to.not.equal(undefined); // Checking that it sets a cookie (the session cookie)
  });

  it("should fail to log in", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(false);
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(401);
  });

  it("should log the user in automatically when using PKI", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(Task, "find").and.returnValue({
      sort: () => [
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "id-1",
          taskType: "Task2",
          params: [],
          sent: false,
        },
        {
          _id: "some-mongo-id",
          order: 0,
          implantId: "id-1",
          taskType: "Task",
          params: ["param1"],
          sent: true,
        },
      ],
    });
    spyOn(pki, "extractUserDetails").and.returnValue("user");

    const wasFalse = securityConfig.usePKI ? false : true;
    if (wasFalse) {
      securityConfig.usePKI = true;
    }

    const res = await agent.get("/api/tasks/id-3");
    expect(res.statusCode).to.equal(200);

    if (wasFalse) {
      securityConfig.usePKI = false;
    }
  });

  it("should log the user in via AD", async () => {
    sinon
      .stub(ActiveDirectory.prototype, "authenticate")
      .callsArgWith(2, null, true);
    const originalSetting = securityConfig.authMethod;
    securityConfig.authMethod = securityConfig.availableAuthMethods.AD;
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
    securityConfig.authMethod = originalSetting;
  });

  it("should log out", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(accessManager, "logout");
    spyOn(argon2, "verify").and.returnValue(true);
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    console.log(cookies);
    const res = await agent
      .delete("/api/access/logout")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
  });

  it("should log out - no-op - if not logged in", async () => {
    spyOn(accessManager, "logout");
    const res = await agent.delete("/api/access/logout");
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to log out - exception thrown", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(accessManager, "logout").and.throwError("TypeError");
    spyOn(argon2, "verify").and.returnValue(true);
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/access/logout")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(500);
  });

  it("should successfully add an admin", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    const findAdminSpy = spyOn(Admin, "findOne");
    findAdminSpy
      .withArgs({ userId: "650a3a2a7dcd3241ecee2d71" })
      .and.returnValue({
        userId: "650a3a2a7dcd3241ecee2d71",
      });
    spyOn(argon2, "verify").and.returnValue(true);

    spyOn(User, "findById")
      .withArgs("650a3a2a7dcd3241ecee2d70")
      .and.returnValue({
        _id: "650a3a2a7dcd3241ecee2d70",
        username: "user2",
        hashedPassword: "hashed",
        save: () => {},
      });
    findAdminSpy
      .withArgs({ userId: "650a3a2a7dcd3241ecee2d70" })
      .and.returnValue(null);
    const createAdminSpy = spyOn(Admin, "create").and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d70",
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];

    const res = await agent
      .put("/api/access/admin")
      .set("Cookie", cookies[0])
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });

    expect(res.statusCode).to.equal(200);
    expect(createAdminSpy.calls.count()).to.equal(1);
  });

  it("should successfully remove an admin", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(true);

    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
      deleteOne: () => {
        return { userId: "650a3a2a7dcd3241ecee2d71" };
      },
    });

    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d70" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d70",
      deleteOne: () => {
        return { userId: "650a3a2a7dcd3241ecee2d70" };
      },
    });
    spyOn(User, "findById")
      .withArgs("650a3a2a7dcd3241ecee2d70")
      .and.returnValue({
        _id: "650a3a2a7dcd3241ecee2d70",
        username: "user2",
        hashedPassword: "hashed",
        save: () => {},
      });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .put("/api/access/admin")
      .set("Cookie", cookies[0])
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: false });
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to add an admin - user does not exist", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });

    spyOn(User, "findById").and.returnValue(null);

    spyOn(Admin, "findOne").and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });
    spyOn(Admin, "create").and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d70",
    });
    spyOn(argon2, "verify").and.returnValue(true);
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .put("/api/access/admin")
      .set("Cookie", cookies[0])
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });
    expect(res.statusCode).to.equal(400);
  });

  it("should fail to add an admin - exception thrown", async () => {
    // Login/Auth stubs
    spyOn(User, "findOne").and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });
    spyOn(argon2, "verify").and.returnValue(true);

    // Test-relevant stubs
    adminStub
      .withArgs({ userId: "650a3a2a7dcd3241ecee2d70" })
      .and.returnValue(null);
    spyOn(Admin, "create").and.throwError("TypeError");
    spyOn(User, "findById")
      .withArgs("650a3a2a7dcd3241ecee2d70")
      .and.returnValue({
        _id: "650a3a2a7dcd3241ecee2d70",
        username: "user2",
        hashedPassword: "hashed",
        save: () => {},
      });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .put("/api/access/admin")
      .set("Cookie", cookies[0])
      .send({ userId: "650a3a2a7dcd3241ecee2d70", makeAdmin: true });
    expect(res.statusCode).to.equal(500);
  });

  it("should fail to log in with invalid auth type", async () => {
    const originalSetting = securityConfig.authMethod;
    securityConfig.authMethod = "fake";
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(500);
    securityConfig.authMethod = originalSetting;
  });
});
