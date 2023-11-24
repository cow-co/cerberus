let agent = null;
let server;
const { purgeCache } = require("../utils");

const tasksService = require("../../db/services/tasks-service");
const accessManager = require("../../security/user-and-access-manager");
const validation = require("../../validation/request-validation");

jest.mock("../../db/services/tasks-service");
jest.mock("../../security/user-and-access-manager");
jest.mock("../../validation/request-validation");

describe("Tasks API Tests", () => {
  afterEach(() => {
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    accessManager.authZCheck.mockResolvedValue(true);
    tasksService.getTasksForImplant.mockImplementation(async (id, history) => {
      if (id === "id-1") {
        if (history) {
          return Promise.resolve([
            {
              _id: "some-mongo-id",
              order: 1,
              implantId: "id-1",
              taskType: "Task2",
              params: [],
              sent: false,
            },
            {
              _id: "some-mongo-id",
              order: 0,
              implantId: "id-1",
              taskType: "Task",
              params: ["param1"],
              sent: true,
            },
          ]);
        } else {
          return Promise.resolve([
            {
              _id: "some-mongo-id",
              order: 1,
              implantId: "id-1",
              taskType: "Task2",
              params: [],
              sent: false,
            },
          ]);
        }
      } else if (id === "id-2") {
        return Promise.resolve([
          {
            _id: "some-mongo-id",
            order: 0,
            implantId: "id-2",
            taskType: "Task",
            params: ["param1"],
            sent: false,
          },
        ]);
      } else if (id === "id-3") {
        return Promise.resolve([]);
      } else if (id === "id-7") {
        return Promise.reject(new TypeError("TEST"));
      }
    });

    tasksService.getTaskTypeById.mockImplementation((id) => {
      if (id === "tasktypeid1") {
        return Promise.resolve({
          _id: "tasktypeid1",
          name: "Name",
          params: [],
        });
      } else if (id === "tasktypeid2") {
        return Promise.resolve({
          _id: "tasktypeid2",
          name: "Name 2",
          params: ["param1", "param2"],
        });
      } else {
        return Promise.resolve(null);
      }
    });

    accessManager.verifyToken.mockImplementation((req, res, next) => {
      req.data = {
        userId: "id",
      };
      next();
    });

    accessManager.checkAdmin.mockImplementation((req, res, next) => {
      req.data = {
        userId: "id",
      };
      next();
    });

    validation.validateTask.mockResolvedValue({
      isValid: true,
      errors: [],
    });
    validation.validateTaskType.mockReturnValue({
      isValid: true,
      errors: [],
    });

    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should get all tasks for an implant (empty array)", async () => {
    const res = await agent.get("/api/tasks/id-3");

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(0);
  });

  test("should get all tasks for an implant (non-empty array)", async () => {
    const res = await agent.get("/api/tasks/id-1");

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
  });

  test("should get all tasks for an implant (including sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=true");

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });

  test("should get all tasks for an implant (explicitly excluding sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=false");

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
  });

  test("should get all tasks for a different implant", async () => {
    const res = await agent.get("/api/tasks/id-2");

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
  });

  test("should fail get all tasks for an implant - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent.get("/api/tasks/id-7");

    expect(res.statusCode).toBe(403);
  });

  test("should fail get all tasks for an implant - exception thrown", async () => {
    const res = await agent.get("/api/tasks/id-7");

    expect(res.statusCode).toBe(500);
  });

  test("should get all task types", async () => {
    tasksService.getTaskTypes.mockResolvedValue([
      {
        name: "Name",
        params: [],
      },
      {
        name: "Name 2",
        params: ["param1", "param2"],
      },
    ]);

    const res = await agent.get("/api/task-types");

    expect(res.statusCode).toBe(200);
    expect(res.body.taskTypes).toHaveLength(2);
  });

  test("should fail to get all task types - exception thrown", async () => {
    tasksService.getTaskTypes.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.get("/api/task-types");

    expect(res.statusCode).toBe(500);
  });

  test("create task - success", async () => {
    tasksService.getTaskById.mockResolvedValue(null);
    tasksService.getTaskTypes.mockResolvedValue([
      {
        _id: "tasktypeid1",
        name: "Name",
        params: [],
      },
      {
        _id: "tasktypeid2",
        name: "Name 2",
        params: ["param1", "param2"],
      },
    ]);
    tasksService.setTask.mockResolvedValue(null);

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(200);
    expect(tasksService.setTask).toHaveBeenCalledTimes(1);
  });

  test("create task - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);
    tasksService.getTaskById.mockResolvedValue(null);
    tasksService.getTaskTypes.mockResolvedValue([
      {
        _id: "tasktypeid1",
        name: "Name",
        params: [],
      },
      {
        _id: "tasktypeid2",
        name: "Name 2",
        params: ["param1", "param2"],
      },
    ]);
    tasksService.setTask.mockResolvedValue(null);

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(403);
    expect(tasksService.setTask).toHaveBeenCalledTimes(0);
  });

  test("create task - failure - validation error", async () => {
    validation.validateTask.mockResolvedValue({
      isValid: false,
      errors: ["error"],
    });

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(400);
  });

  test("create task - failure - error", async () => {
    tasksService.getTaskById.mockResolvedValue(null);
    tasksService.getTaskTypes.mockResolvedValue([
      {
        _id: "tasktypeid1",
        name: "Name",
        params: [],
      },
      {
        _id: "tasktypeid2",
        name: "Name 2",
        params: ["param1", "param2"],
      },
    ]);
    tasksService.setTask.mockResolvedValue("error");

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toHaveLength(1);
    expect(tasksService.setTask).toHaveBeenCalledTimes(1);
  });

  test("create task - failure - exception", async () => {
    tasksService.getTaskById.mockResolvedValue(null);
    tasksService.getTaskTypes.mockResolvedValue([
      {
        _id: "tasktypeid1",
        name: "Name",
        params: [],
      },
      {
        _id: "tasktypeid2",
        name: "Name 2",
        params: ["param1", "param2"],
      },
    ]);
    tasksService.setTask.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.errors).toHaveLength(1);
    expect(tasksService.setTask).toHaveBeenCalledTimes(1);
  });

  test("should edit a task", async () => {
    tasksService.setTask.mockResolvedValue(null);

    const res = await agent.post("/api/tasks").send({
      _id: "id",
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(200);
    expect(tasksService.setTask).toHaveBeenCalledTimes(1);
  });

  test("should create a task type", async () => {
    tasksService.createTaskType.mockResolvedValue({
      _id: "some-mongo-tasktype-id",
      name: "tasktype",
      params: ["param 1"],
    });

    const res = await agent.post("/api/task-types").send({
      name: "tasktype",
      params: ["param 1"],
    });

    expect(res.statusCode).toBe(200);
    expect(tasksService.createTaskType).toHaveBeenCalledTimes(1);
  });

  test("should fail to create a task type - exception thrown", async () => {
    tasksService.createTaskType.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.post("/api/task-types").send({
      name: "tasktype",
      params: ["param 1"],
    });

    expect(res.statusCode).toBe(500);
  });

  test("should fail to create a task type - validation error", async () => {
    validation.validateTaskType.mockReturnValue({
      isValid: false,
      errors: ["error"],
    });

    const res = await agent.post("/api/task-types").send({
      name: "tasktype",
    });

    expect(res.statusCode).toBe(400);
  });

  test("delete task - success", async () => {
    tasksService.getTaskById.mockResolvedValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: false,
    });

    const res = await agent.delete("/api/tasks/some-mongo-id");

    expect(res.statusCode).toBe(200);
  });

  test("delete task - failure - unauthorised", async () => {
    accessManager.authZCheck.mockResolvedValue(false);
    tasksService.getTaskById.mockResolvedValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: false,
    });

    const res = await agent.delete("/api/tasks/some-mongo-id");

    expect(res.statusCode).toBe(403);
  });

  test("delete task - success - ID does not exist", async () => {
    tasksService.getTaskById.mockResolvedValue(null);

    const res = await agent.delete("/api/tasks/some-mongo-if");

    expect(res.statusCode).toBe(200);
  });

  test("delete task - failure - task already sent", async () => {
    accessManager.authZCheck.mockResolvedValue(true);

    tasksService.getTaskById.mockResolvedValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: true,
    });

    const res = await agent.delete("/api/tasks/some-mongo-id");

    expect(res.statusCode).toBe(400);
  });

  test("delete task - failure - exception", async () => {
    tasksService.getTaskById.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.delete("/api/tasks/some-mongo-id");

    expect(res.statusCode).toBe(500);
  });

  test("delete task type - success", async () => {
    const res = await agent.delete("/api/task-types/tasktypeid1");

    expect(res.statusCode).toBe(200);
    expect(tasksService.deleteTaskType).toHaveBeenCalledTimes(1);
  });

  test("delete task type - success - non-existent", async () => {
    const res = await agent.delete("/api/task-types/tasktypeid3");

    expect(res.statusCode).toBe(200);
    expect(tasksService.deleteTaskType).toHaveBeenCalledTimes(0);
  });

  test("delete task type - failure - exception", async () => {
    tasksService.deleteTaskType.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.delete("/api/task-types/tasktypeid1");

    expect(res.statusCode).toBe(500);
  });

  test("get param types - success", async () => {
    tasksService.getParamDataTypes.mockReturnValue(["NUMBER", "STRING"]);

    const res = await agent.get("/api/task-types/param-data-types");

    expect(res.statusCode).toBe(200);
    expect(res.body.dataTypes).toHaveLength(2);
  });
});
