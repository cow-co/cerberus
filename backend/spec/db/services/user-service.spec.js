const User = require("../../../db/models/User");
const userService = require("../../../db/services/user-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/User");

describe("Task service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("find user", () => {});

  test("find user by ID", () => {});

  test("create user", () => {});

  test("delete user", () => {});
});
