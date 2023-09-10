const request = require("supertest");
const server = require("../../index");
const expect = require("chai").expect;
const sinon = require("sinon");
const Task = require("../../db/models/Task");

describe("Tasks API Tests", () => {
  beforeEach(() => {
    sinon.restore();
    const findStub = sinon.stub(Task, "find");
    findStub.withArgs({ implantId: "id-1" }).callsFake(async () => {
      return [
        {
          _id: "some-mongo-id",
          order: 0,
          implantId: "id-1",
          taskType: "Task",
          params: ["param1"],
          sent: true,
        },
        {
          _id: "some-mongo-id",
          order: 1,
          implantId: "id-1",
          taskType: "Task2",
          params: [],
          sent: false,
        },
      ];
    });

    findStub
      .withArgs({ implantId: "id-1", sent: false })
      .callsFake(async () => {
        return [
          {
            _id: "some-mongo-id",
            order: 1,
            implantId: "id-1",
            taskType: "Task2",
            params: [],
            sent: false,
          },
        ];
      });

    findStub
      .withArgs({ implantId: "id-2", sent: false })
      .callsFake(async () => {
        return [
          {
            _id: "some-mongo-id",
            order: 0,
            implantId: "id-2",
            taskType: "Task",
            params: ["param1"],
            sent: false,
          },
        ];
      });
  });

  it("should get all tasks for an implant (empty array)", async () => {
    sinon.restore();
    sinon.stub(Task, "find").callsFake(async () => {
      return [];
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
});
