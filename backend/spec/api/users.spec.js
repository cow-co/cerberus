let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");
const accessManager = require("../../security/access-manager");

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
});
