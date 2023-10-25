let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const Implant = require("../../db/models/Implant");
const Task = require("../../db/models/Task");
const accessManager = require("../../security/user-and-access-manager");

describe("Beacon API tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    sinon.stub(accessManager, "verifySession").callsArg(2);
    agent = require("supertest").agent(require("../../index"));
  });

  it("should succeed", async () => {
    spyOn(Implant, "findOne").and.returnValue(null);
    spyOn(Implant, "create").and.returnValue(null);
    spyOn(Task, "find").and.returnValue({
      sort: () => [
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
          taskType: "Task2",
          params: [],
          sent: false,
        },
      ],
    });
    spyOn(Task, "findByIdAndUpdate").and.returnValue({});

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.deep.equal({
      tasks: [
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
          taskType: "Task2",
          params: [],
          sent: false,
        },
      ],
      errors: [],
    });
  });

  it("should fail - no ID", async () => {
    const res = await agent.post("/api/beacon").send({
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });

  it("should fail - empty ID", async () => {
    const res = await agent.post("/api/beacon").send({
      id: "",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });

  it("should fail - invalid IP", async () => {
    const res = await agent.post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(400);
  });

  it("should fail - negative interval", async () => {
    const res = await agent.post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: -300,
    });

    expect(res.statusCode).to.equal(400);
  });
  it("should fail - zero interval", async () => {
    const res = await agent.post("/api/beacon/").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 0,
    });

    expect(res.statusCode).to.equal(400);
  });
});
