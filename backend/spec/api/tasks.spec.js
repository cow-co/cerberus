let agent = null;
const expect = require("chai").expect;
const sinon = require("sinon");
const Task = require("../../db/models/Task");
const TaskType = require("../../db/models/TaskType");
const accessManager = require("../../security/user-and-access-manager");
const argon2 = require("argon2");

describe("Tasks API Tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    const findStub = spyOn(Task, "find");
    findStub.withArgs({ implantId: "id-1" }).and.returnValue({
      sort: () => [
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
      ],
    });

    findStub.withArgs({ implantId: "id-1", sent: false }).and.returnValue({
      sort: () => [
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "id-1",
          taskType: "Task2",
          params: [],
          sent: false,
        },
      ],
    });

    findStub.withArgs({ implantId: "id-2", sent: false }).and.returnValue({
      sort: () => [
        {
          _id: "some-mongo-id",
          order: 0,
          implantId: "id-2",
          taskType: "Task",
          params: ["param1"],
          sent: false,
        },
      ],
    });

    findStub.withArgs({ implantId: "id-3", sent: false }).and.returnValue({
      sort: () => [],
    });

    const byIdStub = spyOn(TaskType, "findById");
    byIdStub.withArgs("tasktypeid1").and.returnValue({
      _id: "tasktypeid1",
      name: "Name",
      params: [],
    });
    byIdStub.withArgs("tasktypeid2").and.returnValue({
      _id: "tasktypeid2",
      name: "Name 2",
      params: ["param1", "param2"],
    });
    byIdStub.withArgs("tasktypeid3").and.returnValue(null);

    sinon.stub(accessManager, "verifySession").callsArg(2);
    agent = require("supertest").agent(require("../../index"));
  });

  it("should get all tasks for an implant (empty array)", async () => {
    const res = await agent.get("/api/tasks/id-3");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(0);
  });

  it("should get all tasks for an implant (non-empty array)", async () => {
    const res = await agent.get("/api/tasks/id-1");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(1);
  });

  it("should get all tasks for an implant (including sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=true");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(2);
  });

  it("should get all tasks for an implant (explicitly excluding sent)", async () => {
    const res = await agent.get("/api/tasks/id-1?includeSent=false");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(1);
  });

  it("should get all tasks for a different implant", async () => {
    const res = await agent.get("/api/tasks/id-2");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(1);
  });

  it("should get all task types", async () => {
    spyOn(TaskType, "find").and.returnValue([
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
    expect(res.statusCode).to.equal(200);
    expect(res.body.taskTypes.length).to.equal(2);
  });

  it("should create a task", async () => {
    spyOn(TaskType, "find").and.returnValue([
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
    spyOn(Task, "create");
    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      implantId: "id-1",
      params: [],
    });
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to create a task - missing task type name", async () => {
    spyOn(TaskType, "find").and.returnValue([
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
    spyOn(Task, "create");
    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
      },
      implantId: "id-1",
      params: [],
    });
    expect(res.statusCode).to.equal(400);
  });

  it("should fail to create a task - missing implant ID", async () => {
    spyOn(TaskType, "find").and.returnValue([
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
    spyOn(Task, "create");
    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      params: [],
    });
    expect(res.statusCode).to.equal(400);
  });

  it("should create a task type", async () => {
    // Stub user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });

    // Stub for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });

    spyOn(TaskType, "create").and.returnValue({
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
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to create a task type - no params array", async () => {
    // Stub user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });

    // Stub for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
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
      });
    expect(res.statusCode).to.equal(400);
  });

  it("should fail to create a task type - no name", async () => {
    // Stub user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });

    // Stub for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });

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
    expect(res.statusCode).to.equal(400);
  });

  it("should fail to create a task type - duplicated param names", async () => {
    // Stub user-search
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });

    // Stub for login
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
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
        params: ["param 1", "param 2", "param 1"],
      });
    expect(res.statusCode).to.equal(400);
  });

  it("should delete a task", async () => {
    spyOn(Task, "findById").and.returnValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: false,
    });
    spyOn(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-id");
    expect(res.statusCode).to.equal(200);
  });

  it("should return success when the task ID does not exist", async () => {
    spyOn(Task, "findById").and.returnValue(null);
    spyOn(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-if");
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to delete a task - task already sent", async () => {
    spyOn(Task, "findById").and.returnValue({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: true,
    });
    spyOn(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-id");
    expect(res.statusCode).to.equal(400);
  });

  it("should delete a task type", async () => {
    // Stub for login
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(true);
    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });
    const delStub = spyOn(TaskType, "findByIdAndDelete");

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/task-types/tasktypeid1")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
    expect(delStub.calls.count()).to.equal(1);
  });

  it("should return success if deleting a non-existent task type", async () => {
    // Stub for login
    const findWrapper = spyOn(User, "findOne");
    findWrapper.and.returnValue({
      _id: "650a3a2a7dcd3241ecee2d71",
      username: "user",
      hashedPassword: "hashed",
    });
    spyOn(argon2, "verify").and.returnValue(true);

    // Stub the admin-checks
    const adminStub = spyOn(Admin, "findOne");
    adminStub.withArgs({ userId: "650a3a2a7dcd3241ecee2d71" }).and.returnValue({
      userId: "650a3a2a7dcd3241ecee2d71",
    });

    const loginRes = await agent
      .post("/api/access/login")
      .send({ username: "user", password: "abcdefghijklmnopqrstuvwxyZ11" });
    const cookies = loginRes.headers["set-cookie"];
    const res = await agent
      .delete("/api/task-types/tasktypeid3")
      .set("Cookie", cookies[0]);
    expect(res.statusCode).to.equal(200);
  });
});
