let agent = null;
const expect = require("chai").expect;
const sinon = require("sinon");
const Task = require("../../db/models/Task");
const TaskType = require("../../db/models/TaskType");
const accessManager = require("../../security/user-and-access-manager");

describe("Tasks API Tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    const findStub = sinon.stub(Task, "find");
    findStub.withArgs({ implantId: "id-1" }).returns({
      sort: sinon.stub().returns([
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
      ]),
    });

    findStub.withArgs({ implantId: "id-1", sent: false }).returns({
      sort: sinon.stub().returns([
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "id-1",
          taskType: "Task2",
          params: [],
          sent: false,
        },
      ]),
    });

    findStub.withArgs({ implantId: "id-2", sent: false }).returns({
      sort: sinon.stub().returns([
        {
          _id: "some-mongo-id",
          order: 0,
          implantId: "id-2",
          taskType: "Task",
          params: ["param1"],
          sent: false,
        },
      ]),
    });

    findStub.withArgs({ implantId: "id-3", sent: false }).returns({
      sort: sinon.stub().returns([]),
    });

    const byIdStub = sinon.stub(TaskType, "findById");
    byIdStub.withArgs("tasktypeid1").returns({
      _id: "tasktypeid1",
      name: "Name",
      params: [],
    });
    byIdStub.withArgs("tasktypeid2").returns({
      _id: "tasktypeid2",
      name: "Name 2",
      params: ["param1", "param2"],
    });

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
    sinon.stub(TaskType, "find").callsFake(() => {
      return [
        {
          name: "Name",
          params: [],
        },
        {
          name: "Name 2",
          params: ["param1", "param2"],
        },
      ];
    });
    const res = await agent.get("/api/task-types");
    expect(res.statusCode).to.equal(200);
    expect(res.body.taskTypes.length).to.equal(2);
  });

  it("should create a task", async () => {
    sinon.stub(TaskType, "find").callsFake(() => {
      return [
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
      ];
    });
    sinon.stub(Task, "create");
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
    sinon.stub(TaskType, "find").callsFake(() => {
      return [
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
      ];
    });
    sinon.stub(Task, "create");
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
    sinon.stub(TaskType, "find").returns([
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
    sinon.stub(Task, "create");
    const res = await agent.post("/api/tasks").send({
      type: {
        id: "tasktypeid1",
        name: "Name",
      },
      params: [],
    });
    expect(res.statusCode).to.equal(400);
  });

  it("should delete a task", async () => {
    sinon.stub(Task, "findById").returns({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: false,
    });
    sinon.stub(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-id");
    expect(res.statusCode).to.equal(200);
  });

  it("should fail to delete a task - non-existent ID", async () => {
    sinon.stub(Task, "findById").returns(null);
    sinon.stub(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-if");
    expect(res.statusCode).to.equal(400);
  });

  it("should fail to delete a task - task already sent", async () => {
    sinon.stub(Task, "findById").returns({
      _id: "some-mongo-id",
      order: 0,
      implantId: "id-1",
      taskType: "Task",
      params: ["param1"],
      sent: true,
    });
    sinon.stub(Task, "findByIdAndDelete");
    const res = await agent.delete("/api/tasks/some-mongo-id");
    expect(res.statusCode).to.equal(400);
  });
});
