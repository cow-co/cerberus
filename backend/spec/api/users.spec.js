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
      .send({ username: "user", password: "pass" });
    expect(res.statusCode).to.equal(200);
  });
});
