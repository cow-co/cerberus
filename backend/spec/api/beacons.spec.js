let agent;
let server;
const expect = require("chai").expect;
const sinon = require("sinon");
const Implant = require("../../db/models/Implant");
const Task = require("../../db/models/Task");
const accessManager = require("../../security/user-and-access-manager");
const implantService = require("../../db/services/implant-service");
const validation = require("../../validation/request-validation");
const tasksService = require("../../db/services/tasks-service");

// TODO refactor to stub out-of-module calls
describe("Beacon API tests", () => {
  afterEach(() => {
    sinon.restore();
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    spyOn(accessManager, "verifySession").and.callFake((req, res, next) => {
      next();
    });
    server = require("../../index");
    agent = require("supertest").agent(server);
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

  it("should update an existing implant", async () => {
    spyOn(validation, "validateBeacon").and.returnValue({
      isValid: true,
      errors: [],
    });
    spyOn(implantService, "findImplantById").and.returnValue({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.2",
      os: "Windows",
      beaconIntervalSeconds: 500,
    });
    const updateSpy = spyOn(implantService, "updateImplant");
    spyOn(tasksService, "getTasksForImplant").and.returnValue([
      {
        _id: "some-mongo-id",
        order: 1,
        implantId: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
        taskType: "Task2",
        params: [],
        sent: false,
      },
    ]);
    spyOn(tasksService, "taskSent");

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(200);
    expect(updateSpy.calls.count()).to.equal(1);
  });

  // TODO As part of the refactor, these should be moved to a separate spec file for the validator

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

  it("should fail - exception thrown", async () => {
    spyOn(validation, "validateBeacon").and.returnValue({
      isValid: true,
      errors: [],
    });
    spyOn(implantService, "findImplantById").and.returnValue({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.2",
      os: "Windows",
      beaconIntervalSeconds: 500,
    });
    spyOn(implantService, "updateImplant").and.throwError("TypeError");

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).to.equal(500);
  });
});
