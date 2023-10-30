let agent;
let server;
const { purgeCache } = require("../utils");

const accessManager = require("../../security/user-and-access-manager");
const implantService = require("../../db/services/implant-service");
const validation = require("../../validation/request-validation");
const tasksService = require("../../db/services/tasks-service");

jest.mock("../../security/user-and-access-manager");
jest.mock("../../db/services/implant-service");
jest.mock("../../db/services/tasks-service");
jest.mock("../../validation/request-validation");

describe("Beacon API tests", () => {
  afterEach(() => {
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
  // since node caches the app
  beforeEach(() => {
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should succeed", async () => {
    validation.validateBeacon.mockReturnValue({
      isValid: true,
      errors: [],
    });
    implantService.findImplantById.mockResolvedValue(null);
    implantService.addImplant.mockResolvedValue(null);
    tasksService.getTasksForImplant.mockResolvedValue([
      {
        _id: "some-mongo-id",
        order: 1,
        implantId: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
        taskType: "Task2",
        params: [],
        sent: false,
      },
    ]);

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
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

  test("should update an existing implant", async () => {
    validation.validateBeacon.mockReturnValue({
      isValid: true,
      errors: [],
    });
    implantService.findImplantById.mockResolvedValue({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.2",
      os: "Windows",
      beaconIntervalSeconds: 500,
    });
    tasksService.getTasksForImplant.mockResolvedValue([
      {
        _id: "some-mongo-id",
        order: 1,
        implantId: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
        taskType: "Task2",
        params: [],
        sent: false,
      },
    ]);

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).toBe(200);
    expect(implantService.updateImplant).toHaveBeenCalledTimes(1);
  });

  test("should fail - exception thrown", async () => {
    validation.validateBeacon.mockReturnValue({
      isValid: true,
      errors: [],
    });
    implantService.findImplantById.mockResolvedValue({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.2",
      os: "Windows",
      beaconIntervalSeconds: 500,
    });
    implantService.updateImplant.mockRejectedValue(new Error("TypeError"));

    const res = await agent.post("/api/beacon").send({
      id: "eb706e60-5b2c-47f5-bc32-45e1765f7ce8",
      ip: "192.168.0.1",
      os: "Windows 6.1.7601.17592",
      beaconIntervalSeconds: 300,
    });

    expect(res.statusCode).toBe(500);
  });

  // TODO Test that 400 when validation error
});
