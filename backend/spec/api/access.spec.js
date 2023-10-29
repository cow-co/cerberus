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
    const userSpy = spyOn(accessManager, "register").and.resolveTo({
      _id: "some-mongo-id",
      errors: [],
    });
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
    expect(userSpy.calls.count()).to.equal(1);
  });

  it("should fail to create a user - error occurred", async () => {
    spyOn(accessManager, "register").and.resolveTo({
      _id: null,
      errors: ["ERROR"],
    });
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(500);
  });

  it("should fail to create a user - exception thrown", async () => {
    spyOn(accessManager, "register").and.throwError("TypeError");
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(500);
  });

  it("should log in", async () => {
    let called = true;
    spyOn(accessManager, "authenticate").and.callFake((req, res, next) => {
      called = true;
      next();
    });
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
    expect(called).to.be.true;
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
    const res = await agent
      .delete("/api/access/logout")
      .set(
        "Cookie",
        "connect.sid=s%3A0DevNUMyEEu5wSJLaCoGf8XWytEJmuvX.OLcfLMnq7MRfXoGZVFFYYlwtsqd%2FPIyJCNcuoCNs5mg"
      );
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
