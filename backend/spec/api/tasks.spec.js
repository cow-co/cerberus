const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const Task = require("../../db/models/Task");
const TaskType = require("../../db/models/TaskType");

describe("Tasks API Tests", () => {
  beforeEach(() => {
    sinon.restore();
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
  });

  it("should get all tasks for an implant (empty array)", async () => {
    sinon.restore();
    sinon.stub(Task, "find").returns({
      sort: sinon.stub().returns([]),
    });
    const res = await request(server).get("/api/tasks/id-1");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(0);
  });

  it("should get all tasks for an implant (non-empty array)", async () => {
    const res = await request(server).get("/api/tasks/id-1");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(1);
  });

  it("should get all tasks for an implant (including sent)", async () => {
    const res = await request(server).get("/api/tasks/id-1?includeSent=true");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(2);
  });

  it("should get all tasks for an implant (explicitly excluding sent)", async () => {
    const res = await request(server).get("/api/tasks/id-1?includeSent=false");
    expect(res.statusCode).to.equal(200);
    expect(res.body.tasks.length).to.equal(1);
  });

  it("should get all tasks for a different implant", async () => {
    const res = await request(server).get("/api/tasks/id-2");
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
    const res = await request(server).get("/api/task-types");
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
    const res = await request(server)
      .post("/api/tasks")
      .send({
        type: {
          id: "tasktypeid1",
          name: "Name",
        },
        implantId: "id-1",
        params: [],
      });
    expect(res.statusCode).to.equal(200);
  });
});
