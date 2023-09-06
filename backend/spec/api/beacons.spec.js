const request = require("supertest");
const server = require("../../../index");
const expect = require("chai").expect;

describe("Beacon API tests", () => {
  it("should succeed", async () => {
    const res = await request(server).post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(200);
  });
});
