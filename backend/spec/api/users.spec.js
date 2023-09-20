const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../../db/models/User");

describe("User tests", () => {
  it("should create a user", async () => {
    sinon.stub(User, "create").returns({
      _id: "some-mongo-id",
      username: "user",
      hashedPassword: "hashed",
      acgs: [],
    });
    const res = await request(server)
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to create a user - no uppercase", async () => {
    const res = await request(server)
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyz11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no lowercase", async () => {
    const res = await request(server)
      .post("/api/users/register")
      .send({ username: "user", password: "ABCDEFGHIJKLMNOPQRSTUVWXYZ11" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - no number", async () => {
    const res = await request(server)
      .post("/api/users/register")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });

  it("should fail to create a user - too short", async () => {
    const res = await request(server)
      .post("/api/users/register")
      .send({ username: "user", password: "Ab1" });
    expect(res.statusCode).to.equal(400);
    expect(res.body.errors.length).to.equal(1);
  });
});
