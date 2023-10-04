let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");
const accessManager = require("../../security/access-manager");
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
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    const res = await agent.get("/api/users/username");
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.name).to.equal("username");
  });

  it("should remove hashed password from user in response", async () => {
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });
    const res = await agent.get("/api/users/username");
    expect(res.statusCode).to.equal(200);
    expect(res.body.user.hashedPassword).to.equal(undefined);
  });

  // TODO test with admin and with non-admin
  it("should delete a user", async () => {
    const findWrapper = sinon.stub(User, "findOne");
    findWrapper.returns({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    findWrapper.withArgs({ name: "user2" }).returns({
      _id: "650a3a2a7dcd3241ecee2d70",
      username: "user2",
      hashedPassword: "hashed",
      save: () => {},
    });
    sinon.stub(argon2, "verify").returns(true);
    const adminStub = sinon.stub(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).returns({
      userId: "650a3a2a7dcd3241ecee2d71",
      deleteOne: () => {
        return { userId: "650a3a2a7dcd3241ecee2d71" };
      },
    });
    const delStub = sinon.stub(User, "findByIdAndDelete").returns({
      _id: "some-mongo-id3",
      name: "username",
      hashedPassword: "hashed",
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/users/some-mongo-id3")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
    expect(delStub.calledOnce()).to.be.true;
  });
});
