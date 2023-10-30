let agent = null;
let server;
const { purgeCache } = require("../utils");

const tasksService = require("../../db/services/tasks-service");
const accessManager = require("../../security/user-and-access-manager");
const argon2 = require("argon2");
const validation = require("../../validation/request-validation");

// TODO Refactor to only test the given unit
describe("Tasks API Tests", () => {
  afterEach(() => {
    sinon.restore();
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    const findStub = spyOn(tasksService, "getTasksForImplant");
    findStub.withArgs("id-1", true).and.resolveTo([
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
    findStub.withArgs("id-1", false).and.resolveTo([
      {
        _id: "some-mongo-id",
        order: 1,
        implantId: "id-1",
        taskType: "Task2",
        params: [],
        sent: false,
      },
    ]);
    findStub.withArgs("id-2", false).and.resolveTo([
      {
        _id: "some-mongo-id",
        order: 0,
        implantId: "id-2",
        taskType: "Task",
        params: ["param1"],
        sent: false,
      },
    ]);
    findStub.withArgs("id-3", false).and.resolveTo([]);
    findStub.withArgs("id-7", false).and.throwError("TypeError");

    const byIdStub = spyOn(tasksService, "getTaskTypeById");
    byIdStub.withArgs("tasktypeid1").and.resolveTo({
      _id: "tasktypeid1",
      name: "Name",
      params: [],
    });
    byIdStub.withArgs("tasktypeid2").and.resolveTo({
      _id: "tasktypeid2",
      name: "Name 2",
      params: ["param1", "param2"],
    });
    byIdStub.withArgs("tasktypeid3").and.resolveTo(null);

    // Stubbing the actual auth middlewares seems to be broken, so we stub the sub-calls
    spyOn(argon2, "verify").and.returnValue(true);
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.resolveTo({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.resolveTo({
      userId: "650a3a2a7dcd3241ecee2d71",
    });

    spyOn(validation, "validateTask").and.resolveTo(true);
    spyOn(validation, "validateTaskType").and.returnValue(true);

    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should get all tasks for an implant (empty array)", async () => {
    const res = await agent.get("/api/tasks/id-3");
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBe(0);
  });

  test("should get all tasks for an implant (non-empty array)", async () => {
    const res = await agent.get("/api/tasks/id-1");
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBe(1);
  });

  test("should get all tasks for an implant (including sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBe(2);
  });

  test("should get all tasks for an implant (explicitly excluding sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=false");
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBe(1);
  });

  test("should get all tasks for a different implant", async () => {
    const res = await agent.get("/api/tasks/id-2");
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBe(1);
  });

  test("should fail get all tasks for an implant - exception thrown", async () => {
    const res = await agent.get("/api/tasks/id-7");
    expect(res.statusCode).toBe(500);
  });

  test("should get all task types", async () => {
    spyOn(tasksService, "getTaskTypes").and.returnValue([
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
    expect(res.body.taskTypes.length).toBe(2);
  });

  test("should fail to get all task types - exception thrown", async () => {
    spyOn(tasksService, "getTaskTypes").and.throwError("TypeError");
    const res = await agent.get("/api/task-types");
    expect(res.statusCode).toBe(500);
  });

  test("should create a task", async () => {
    spyOn(tasksService, "getTaskById").and.resolveTo(null);
    spyOn(tasksService, "getTaskTypes").and.resolveTo([
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
    const createSpy = spyOn(tasksService, "setTask");

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(200);
    expect(createSpy.calls.count()).toBe(1);
  });

  test("should fail to create a task - missing task type name", async () => {
    spyOn(tasksService, "getTaskById").and.returnValue(null);
    spyOn(tasksService, "getTaskTypes").and.returnValue([
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

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
      },
      implantId: "id-1",
      params: [],
    });

    expect(res.statusCode).toBe(400);
  });

  test("should fail to create a task - missing implant ID", async () => {
    spyOn(tasksService, "getTaskById").and.returnValue(null);
    spyOn(tasksService, "getTaskTypes").and.returnValue([
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

    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      params: [],
    });

    expect(res.statusCode).toBe(400);
  });

  test("should edit a task", async () => {
    const spy = spyOn(tasksService, "setTask").and.resolveTo(null);

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
    expect(spy.calls.count()).toBe(1);
  });

  test("should create a task type", async () => {
    spyOn(tasksService, "createTaskType").and.returnValue({
      _id: "some-mongo-tasktype-id",
      name: "tasktype",
      params: ["param 1"],
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .post("/api/task-types")
      .set("Cookie", cookies[0])
      .send({
        name: "tasktype",
        params: ["param 1"],
      });
    expect(res.statusCode).toBe(200);
  });

  test("should fail to create a task type - exception thrown", async () => {
    spyOn(tasksService, "createTaskType").and.throwError("TypeError");

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .post("/api/task-types")
      .set("Cookie", cookies[0])
      .send({
        name: "tasktype",
        params: ["param 1"],
      });

    expect(res.statusCode).toBe(500);
  });

  test("should fail to create a task type - no params array", async () => {
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .post("/api/task-types")
      .set("Cookie", cookies[0])
      .send({
        name: "tasktype",
      });

    expect(res.statusCode).toBe(400);
  });

  test("should fail to create a task type - no name", async () => {
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .post("/api/task-types")
      .set("Cookie", cookies[0])
      .send({
        params: ["param 1"],
      });

    expect(res.statusCode).toBe(400);
  });

  test("should fail to create a task type - duplicated param names", async () => {
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .post("/api/task-types")
      .set("Cookie", cookies[0])
      .send({
        name: "tasktype",
        params: ["param 1", "param 2", "param 1"],
      });

    expect(res.statusCode).toBe(400);
  });

  test("should delete a task", async () => {
    spyOn(tasksService, "getTaskById").and.returnValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: false,
    });
    spyOn(tasksService, "deleteTask");

    const res = await agent.delete("/api/tasks/some-mongo-id");

    expect(res.statusCode).toBe(200);
  });

  test("should return success when the task ID does not exist", async () => {
    spyOn(tasksService, "getTaskById").and.returnValue(null);

    const res = await agent.delete("/api/tasks/some-mongo-if");

    expect(res.statusCode).toBe(200);
  });

  test("should fail to delete a task - task already sent", async () => {
    spyOn(tasksService, "getTaskById").and.returnValue({
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

  test("should delete a task type", async () => {
    const delStub = spyOn(tasksService, "deleteTaskType");

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/task-types/tasktypeid1")
      .set("Cookie", cookies[0]);

    expect(res.statusCode).toBe(200);
    expect(delStub.calls.count()).toBe(1);
  });

  test("should return success if deleting a non-existent task type", async () => {
    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/task-types/tasktypeid3")
      .set("Cookie", cookies[0]);

    expect(res.statusCode).toBe(200);
  });
});
