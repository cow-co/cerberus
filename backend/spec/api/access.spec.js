let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");
const accessManager = require("../../security/access-manager");
const argon2 = require("argon2");
const securityConfig = require("../../config/security-config");
const pki = require("../../security/pki");
const ActiveDirectory = require("activedirectory");
const Task = require("../../db/models/Task");

describe("User tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    sinon.stub(accessManager, "verifySession").callsArg(2);
    agent = require("supertest").agent(require("../../index"));
  });

  it("should create a user", async () => {
    sinon.stub(User, "create").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    const res = await agent
      .post("/api/access/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
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
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    sinon.stub(argon2, "verify").returns(true);
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to log in", async () => {
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    sinon.stub(argon2, "verify").returns(false);
    const res = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(401);
  });

  it("should log the user in automatically when using PKI", async () => {
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
    });
    sinon.stub(Task, "find").returns({
      sort: sinon.stub().returns([
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
      ]),
    });
    sinon.stub(pki, "extractUserDetails").returns("user");

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

  it("should successfully add an admin", async () => {
    const findWrapper = sinon.stub(User, "findOne");
    findWrapper.returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
      isAdmin: true,
    });
    findWrapper.withArgs({ name: "user2" }).returns({
      _id: "some-mongo-id2",
      username: "user2",
      hashedPassword: "hashed",
      isAdmin: true,
      save: () => {},
    });
    sinon.stub(argon2, "verify").returns(true);
    const res1 = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    console.log(res1.headers["set-cookie"]);
    const res = await agent
      .put("/api/access/admin")
      .send({ username: "user2", makeAdmin: true });
    expect(res.statusCode).to.equal(200);
  });

  // TODO Test invalid auth method
  // TODO Test exception-handling in...basically everywhere
  // TODO Test verifySession *without* a session; with PKI and without PKI
});
