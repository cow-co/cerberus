const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const Implant = require("../../db/models/Implant");

describe("Beacon API tests", () => {
  it("should succeed", async () => {
    sinon.stub(Implant, "findOne").callsFake(async () => {
      return null;
    });
    sinon.stub(Implant, "create").callsFake(async () => {
      return null;
    });
    const res = await request(server).post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(200);
  });

  it("should fail - no ID", async () => {
    const res = await request(server).post("/api/beacon").send({
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });
  it("should fail - empty ID", async () => {
    const res = await request(server).post("/api/beacon").send({
      id: "",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });
  it("should fail - invalid IP", async () => {
    const res = await request(server).post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });
  it("should fail - negative interval", async () => {
    const res = await request(server).post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: -300,
    });

    expect(res.statusCode).to.equal(400);
  });
  it("should fail - zero interval", async () => {
    const res = await request(server).post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 0,
    });

    expect(res.statusCode).to.equal(400);
  });
});
