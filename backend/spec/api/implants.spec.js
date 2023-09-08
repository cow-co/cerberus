const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const utils = require("../utils");

describe("Implant API Tests", () => {
  beforeAll(async () => await utils.connect());

  afterEach(async () => await utils.clearDB());

  afterAll(async () => await utils.closeDB());

  it("should get all implants (empty array)", async () => {
    const res = await request(server).get("/api/implants/");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(0);
  });
});
