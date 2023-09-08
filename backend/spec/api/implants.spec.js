const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const implantService = require("../../db/services/implant-service");

describe("Implant API Tests", () => {
  it("should get all implants (empty array)", async () => {
    const stub = sinon.stub(implantService, "getAllImplants");
    stub.callsFake(() => {
      console.log("kjsahdfkjahsdfkjahsdfkjhaskdfh");
      return [];
    });
    const res = await request(server).get("/api/implants/");
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.equal([]);
  });
});
