const Task = require("../../../db/models/Task");
const TaskType = require("../../../db/models/TaskType");
const tasksService = require("../../../db/services/tasks-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/Task");
jest.mock("../../../db/models/TaskType");

describe("Task service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    jest.spyOn(Task, "find").mockImplementation((filter) => {
      if (filter.sent === undefined || filter.sent === true) {
        return {
          sort: () => [
            {
              order: 1,
              implantId: "id",
              taskType: "type",
              params: [],
              sent: false,
            },
            {
              order: 0,
              implantId: "id",
              taskType: "type",
              params: [],
              sent: true,
            },
          ],
        };
      } else {
        return {
          sort: () => [
            {
              order: 1,
              implantId: "id",
              taskType: "type",
              params: [],
              sent: false,
            },
          ],
        };
      }
    });

    TaskType.find.mockResolvedValue([
      {
        name: "type",
        params: [],
      },
      {
        name: "type 2",
        params: ["param 1"],
      },
    ]);
  });

  test("get tasks for implant - success - with sent", async () => {
    const result = await tasksService.getTasksForImplant("id", true);

    expect(result).toHaveLength(2);
  });

  test("get tasks for implant - success - without sent", async () => {
    const result = await tasksService.getTasksForImplant("id", false);

    expect(result).toHaveLength(1);
  });

  test("get task by ID - success", async () => {
    Task.findById.mockResolvedValue({
      order: 1,
      implantId: "id",
      taskType: "type",
      params: [],
      sent: false,
    });

    const res = await tasksService.getTaskById("id");

    expect(res.order).toBe(1);
  });

  test("get task types - success", async () => {
    const types = await tasksService.getTaskTypes();

    expect(types).toHaveLength(2);
  });

  test("get task type by ID - success", async () => {
    TaskType.findById.mockResolvedValue({
      _id: "id",
      name: "type",
    });

    const type = await tasksService.getTaskTypeById("id");

    expect(type.name).toBe("type");
  });

  test("send task - success", async () => {
    await tasksService.taskSent("task");

    const args = Task.findByIdAndUpdate.mock.calls[0];
    expect(Task.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(args[0]).toBe("task");
    expect(args[1]).toEqual({ sent: true });
  });

  test("create task - success", async () => {
    const error = await tasksService.setTask({
      type: "type",
    });

    const args = Task.create.mock.calls[0];
    expect(error).toBeNull();
  });

  test("edit task - success", async () => {
    let called = false;
    let calledWith = null;
    Task.findById.mockResolvedValue({
      _id: "id",
      order: 1,
      implantId: "imp",
      taskType: "type",
      params: [],
      sent: false,
      updateOne: async (data) => {
        called = true;
        calledWith = data;
        Promise.resolve();
      },
    });

    const error = await tasksService.setTask({
      _id: "id",
      order: 1,
      implantId: "imp",
      taskType: "type",
      params: ["hi"],
      sent: false,
    });

    expect(error).toBeNull();
    expect(called).toBeTruthy();
    expect(calledWith.order).toBe(1);
    expect(calledWith.params[0]).toBe("hi");
  });

  test("edit task - failure - already sent", async () => {
    Task.findById.mockResolvedValue({
      _id: "id",
      order: 1,
      implantId: "imp",
      taskType: "type",
      params: [],
      sent: true,
    });

    const error = await tasksService.setTask({
      _id: "id",
      type: "type",
      params: ["hi"],
    });

    expect(error).not.toBeNull();
  });

  test("create task type - success", async () => {
    await tasksService.createTaskType({
      name: "name",
      params: ["param1", "p2"],
    });

    const args = TaskType.create.mock.calls[0];
    expect(args[0].name).toBe("name");
    expect(args[0].params).toHaveLength(2);
  });

  test("delete task - success", async () => {
    await tasksService.deleteTask("id");

    expect(Task.findByIdAndDelete).toHaveBeenCalledTimes(1);
  });

  test("delete task type - success", async () => {
    await tasksService.deleteTaskType("id");

    expect(TaskType.findByIdAndDelete).toHaveBeenCalledTimes(1);
  });
});
