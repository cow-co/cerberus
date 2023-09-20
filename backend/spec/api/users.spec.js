let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");
const userManager = require("../../users/user-manager");
const argon2 = require("argon2");

describe("User tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    sinon.stub(userManager, "verifySession").callsArg(2);
    agent = require("supertest").agent(require("../../index"));
  });

  it("should create a user", async () => {
    sinon.stub(User, "create").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
      acgs: [],
    });
    const res = await agent
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to create a user - no uppercase", async () => {
    const res = await agent
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyz11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no lowercase", async () => {
    const res = await agent
      .post("/api/users/register")
      .send({ username: "user", password: "ABCDEFGHIJKLMNOPQRSTUVWXYZ11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no number", async () => {
    const res = await agent
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - too short", async () => {
    const res = await agent
      .post("/api/users/register")
      .send({ username: "user", password: "Ab1" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should log in", async () => {
    sinon.stub(User, "findOne").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
      acgs: [],
    });
    sinon.stub(argon2, "verify").returns(true);
    const res = await agent
      .post("/api/users/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
  });

  // TODO Logout tests?
});
