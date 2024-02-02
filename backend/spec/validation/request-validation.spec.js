const { purgeCache } = require("../utils");
const validation = require("../../validation/request-validation");
const tasksService = require("../../db/services/tasks-service");

jest.mock("../../db/services/tasks-service");

describe("Beacon validation tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("Beacon validation - success - IPv4", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeTruthy();
  });

  test("Beacon validation - success - IPv6", () => {
    const beacon = {
      id: "someid",
      ip: "::1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeTruthy();
  });

  test("Beacon validation - success - no IP", () => {
    const beacon = {
      id: "someid",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeTruthy();
  });

  test("Beacon validation - failure - no ID", () => {
    const beacon = {
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });

  test("Beacon validation - failure - IPv4", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });

  test("Beacon validation - failure - IPv6", () => {
    const beacon = {
      id: "someid",
      ip: ":z:1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });

  test("Beacon validation - failure - no interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });

  test("Beacon validation - failure - negative interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: -500,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });

  test("Beacon validation - failure - zero interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 0,
    };

    expect(validation.validateBeacon(beacon).isValid).toBeFalsy();
  });
});

describe("Task validation tests", () => {
  test("validate task - success - no params", async () => {
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
    expect(res.isValid).toBeTruthy();
  });

  test("validate task - success - some params", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [
        {
          name: "param 1",
          type: "NUMBER",
        },
        {
          name: "param 2",
          type: "STRING",
        },
      ],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 1",
          value: "25",
        },
        {
          name: "param 2",
          value: "val2",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBeTruthy();
  });

  test("validate task - failure - expects string, gets number", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [
        {
          name: "param 2",
          type: "STRING",
        },
      ],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 2",
          value: 10,
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - expects number, gets string with no digits", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [
        {
          name: "param 2",
          type: "NUMBER",
        },
      ],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 2",
          value: "hello",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - expects number, gets string with digits and letters", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [
        {
          name: "param 2",
          type: "NUMBER",
        },
      ],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 2",
          value: "11lo",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - success - float", async () => {
    tasksService.getTaskTypeById.mockResolvedValue({
      id: "id",
      name: "task type",
      params: [
        {
          name: "param 2",
          type: "NUMBER",
        },
      ],
    });

    const task = {
      taskType: {
        id: "id",
        name: "task type",
      },
      params: [
        {
          name: "param 2",
          value: "10.5",
        },
      ],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).toBeTruthy();
  });

  test("validate task - failure - no type", async () => {
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
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - faiure - no type id", async () => {
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
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - no type name", async () => {
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
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - no matching task type", async () => {
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
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - wrong param count", async () => {
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
    expect(res.isValid).toBeFalsy();
  });

  test("validate task - failure - no implant ID", async () => {
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
    expect(res.isValid).toBeFalsy();
  });
});

describe("Task type validation tests", () => {
  test("Validate task type - success - empty params", () => {
    const taskType = {
      name: "type",
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).toBeTruthy();
  });

  test("Validate task type - success - some params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2"],
    };

    expect(validation.validateTaskType(taskType).isValid).toBeTruthy();
  });

  test("Validate task type - failure - no params list", () => {
    const taskType = {
      name: "type",
    };

    expect(validation.validateTaskType(taskType).isValid).toBeFalsy();
  });

  test("Validate task type - failure - no name", () => {
    const taskType = {
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).toBeFalsy();
  });

  test("Validate task type - failure - repeated params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2", "param 1"],
    };

    expect(validation.validateTaskType(taskType).isValid).toBeFalsy();
  });
});
