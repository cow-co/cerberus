const { purgeCache } = require("../utils");
const validation = require("../../validation/request-validation");
const tasksService = require("../../db/services/tasks-service");

jest.mock("../../db/services/tasks-service");

describe("Beacon validation tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should be valid (IPv4)", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(true);
  });

  test("should be valid (IPv6)", () => {
    const beacon = {
      id: "someid",
      ip: "::1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(true);
  });

  test("should be valid (no IP)", () => {
    const beacon = {
      id: "someid",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(true);
  });

  test("should be invalid - no ID", () => {
    const beacon = {
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });

  test("should be invalid - invalid IPv4", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });

  test("should be invalid - invalid IPv6", () => {
    const beacon = {
      id: "someid",
      ip: ":z:1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });

  test("should be invalid - no interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });

  test("should be invalid - negative interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: -500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });

  test("should be invalid - zero interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 0,
    };

    expect(validation.validateBeacon(beacon).isValid).toBe(false);
  });
});

describe("Task validation tests", () => {
  test("should be valid - no params", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [],
    });
    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(true);
  });

  test("should be valid - some params", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: ["param 1", "param 2"],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 1",
          value: "val",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(true);
  });

  test("should be invalid - no type", async () => {
    const task = {
      params: [
        {
          name: "param 1",
          value: "val",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });

  test("should be invalid - no type id", async () => {
    const task = {
      taskType: {
        name: "task type",
      },
      params: [
        {
          name: "param 1",
          value: "val",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });

  test("should be invalid - no type name", async () => {
    const task = {
      taskType: {
        id: "id",
      },
      params: [
        {
          name: "param 1",
          value: "val",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });

  test("should be valid - no matching task type", async () => {
    tasksService.getTaskTypeById.mockResolvedValue(null);

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 1",
          value: "val",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });

  test("should be valid - wrong param count", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: ["param 1", "param 2"],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 1",
          value: "val",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });

  test("should be invalid - no implant ID", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [],
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBe(false);
  });
});

describe("Task type validation tests", () => {
  test("should be valid - empty params", () => {
    const taskType = {
      name: "type",
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).toBe(true);
  });

  test("should be valid - some params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2"],
    };

    expect(validation.validateTaskType(taskType).isValid).toBe(true);
  });

  test("should be invalid - no params list", () => {
    const taskType = {
      name: "type",
    };

    expect(validation.validateTaskType(taskType).isValid).toBe(false);
  });

  test("should be invalid - no name", () => {
    const taskType = {
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).toBe(false);
  });

  test("should be invalid - repeated params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2", "param 1"],
    };

    expect(validation.validateTaskType(taskType).isValid).toBe(false);
  });
});
