const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const Implant = require("../../db/models/Implant");

describe("Implant API Tests", () => {
  it("should get all implants (empty array)", async () => {
    let spied = sinon.stub(Implant, "find").callsFake(async () => {
      return [];
    });
    const res = await request(server).get("/api/implants/");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(0);
  });
});
