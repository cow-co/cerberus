const Task = require("../../../db/models/Task");
const taskService = require("../../../db/services/task-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/Task");

describe("Task service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("get tasks for implant - success - with sent", () => {});

  test("get tasks for implant - success - without sent", () => {});

  test("get task by ID - success", () => {});

  test("get task types - success", () => {});

  test("get task type by ID - success", () => {});

  test("send task - success", () => {});

  test("create task - success", () => {});

  test("edit task - success", () => {});

  test("edit task - failure - already sent", () => {});

  test("create task type - success", () => {});

  test("delete task - success", () => {});

  test("delete task type - success", () => {});
});
