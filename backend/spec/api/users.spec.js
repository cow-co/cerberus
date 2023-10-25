let agent;
const expect = require("chai").expect;
const User = require("../../db/models/User");
const accessManager = require("../../security/user-and-access-manager");
const sinon = require("sinon");
const Admin = require("../../db/models/Admin");
const argon2 = require("argon2");

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

  it("should find a user", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    const res = await agent.get("/api/users/user/username");
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.name).to.equal("username");
  });

  it("should remove hashed password from user in response", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    const res = await agent.get("/api/users/user/username");
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.hashedPassword).to.equal(undefined);
  });

  it("should delete a user", async () => {
    // Stub user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    findWrapper.withArgs({ name: "user2" }).and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d70",
      username: "user2",
      hashedPassword: "hashed",
      save: () => {},
    });

    // Stub for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });
    adminStub.withArgs({ userId: "some-mongo-id3" }).and.returnValue(null);

    const delStub = spyOn(User, "findByIdAndDelete").and.returnValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/users/user/some-mongo-id3")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
    expect(delStub.calls.count()).to.equal(1);
    expect(adminStub.calls.count()).to.equal(2);
  });

  it("should fail to delete a user - not admin", async () => {
    // Stubbing user search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    findWrapper.withArgs({ name: "user2" }).and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d70",
      username: "user2",
      hashedPassword: "hashed",
      save: () => {},
    });

    // Stubbing for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stubbing the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub
      .withArgs({ userId: "650a3a2a7dcd3241ecee2d71" })
      .and.returnValue(null);

    spyOn(User, "findByIdAndDelete");

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/users/user/some-mongo-id3")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(403);
  });

  it("should return success when deleting a user that does not exist", async () => {
    // Stubbing the user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(User, "findById").and.returnValue(null);
    spyOn(User, "findByIdAndDelete").and.throwError("DocumentNotFoundError");

    // Stubbing the login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stubbing the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/users/user/some-mongo-id3")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
  });

  it("should remove hashed password from user in response", async () => {
    spyOn(User, "findOne").and.returnValue({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    const res = await agent.get("/api/users/user/username");
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.hashedPassword).to.equal(undefined);
  });

  it("should check session and return username", async () => {
    // Stub for login
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(true);

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .get("/api/users/check-session")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
    expect(res.body.username).to.equal("user");
  });
});
