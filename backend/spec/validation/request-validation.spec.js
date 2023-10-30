const expect = require("chai").expect;
const { purgeCache } = require("../utils");
const validation = require("../../validation/request-validation");
const tasksService = require("../../db/services/tasks-service");

describe("Beacon validation tests", () => {
  afterAll(() => {
    purgeCache();
  });

  it("should be valid (IPv4)", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.true;
  });

  it("should be valid (IPv6)", () => {
    const beacon = {
      id: "someid",
      ip: "::1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.true;
  });

  it("should be valid (no IP)", () => {
    const beacon = {
      id: "someid",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.true;
  });

  it("should be invalid - no ID", () => {
    const beacon = {
      ip: "127.0.0.1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });

  it("should be invalid - invalid IPv4", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });

  it("should be invalid - invalid IPv6", () => {
    const beacon = {
      id: "someid",
      ip: ":z:1",
      beaconIntervalSeconds: 500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });

  it("should be invalid - no interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });

  it("should be invalid - negative interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: -500,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });

  it("should be invalid - zero interval", () => {
    const beacon = {
      id: "someid",
      ip: "127.0.0.1",
      beaconIntervalSeconds: 0,
    };

    expect(validation.validateBeacon(beacon).isValid).to.be.false;
  });
});

describe("Task validation tests", () => {
  it("should be valid - no params", async () => {
    spyOn(tasksService, "getTaskTypeById").and.returnValue({
      id: "id",
      name: "task type",
      params: [],
    });
    const task = {
      type: {
        id: "id",
        name: "task type",
      },
      params: [],
      implantId: "implant",
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).to.be.true;
  });

  it("should be valid - some params", async () => {
    spyOn(tasksService, "getTaskTypeById").and.returnValue({
      id: "id",
      name: "task type",
      params: ["param 1", "param 2"],
    });
    const task = {
      type: {
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
    expect(res.isValid).to.be.true;
  });

  it("should be invalid - no type", async () => {
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
    expect(res.isValid).to.be.false;
  });

  it("should be invalid - no type id", async () => {
    const task = {
      type: {
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
    expect(res.isValid).to.be.false;
  });

  it("should be invalid - no type name", async () => {
    const task = {
      type: {
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
    expect(res.isValid).to.be.false;
  });

  it("should be valid - no matching task type", async () => {
    spyOn(tasksService, "getTaskTypeById").and.returnValue(null);
    const task = {
      type: {
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
    expect(res.isValid).to.be.false;
  });

  it("should be valid - wrong param count", async () => {
    spyOn(tasksService, "getTaskTypeById").and.returnValue({
      id: "id",
      name: "task type",
      params: ["param 1", "param 2"],
    });
    const task = {
      type: {
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
    expect(res.isValid).to.be.false;
  });

  it("should be invalid - no implant ID", async () => {
    spyOn(tasksService, "getTaskTypeById").and.returnValue({
      id: "id",
      name: "task type",
      params: [],
    });
    const task = {
      type: {
        id: "id",
        name: "task type",
      },
      params: [],
    };

    const res = await validation.validateTask(task);
    expect(res.isValid).to.be.false;
  });
});

describe("Task type validation tests", () => {
  it("should be valid - empty params", () => {
    const taskType = {
      name: "type",
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).to.be.true;
  });

  it("should be valid - some params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2"],
    };

    expect(validation.validateTaskType(taskType).isValid).to.be.true;
  });

  it("should be invalid - no params list", () => {
    const taskType = {
      name: "type",
    };

    expect(validation.validateTaskType(taskType).isValid).to.be.false;
  });

  it("should be invalid - no name", () => {
    const taskType = {
      params: [],
    };

    expect(validation.validateTaskType(taskType).isValid).to.be.false;
  });

  it("should be invalid - repeated params", () => {
    const taskType = {
      name: "type",
      params: ["param 1", "param 2", "param 1"],
    };

    expect(validation.validateTaskType(taskType).isValid).to.be.false;
  });
});
