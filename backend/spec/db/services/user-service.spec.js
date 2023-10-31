const User = require("../../../db/models/User");
const userService = require("../../../db/services/user-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/User");

describe("User service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("find user", async () => {
    User.findOne.mockResolvedValue({
      _id: "id",
      name: "user",
    });

    const user = await userService.findUser("user");

    expect(user._id).toBe("id");
  });

  test("find user by ID", async () => {
    User.findById.mockResolvedValue({
      _id: "id",
      name: "user",
    });

    const user = await userService.findUserById("id");

    expect(user.name).toBe("user");
  });

  test("create user", async () => {
    await userService.createUser({
      name: "user",
    });

    const args = User.create.mock.calls[0];

    expect(args[0].name).toBe("user");
  });

  test("delete user", async () => {
    await userService.deleteUser("id");

    const args = User.findByIdAndDelete.mock.calls[0];

    expect(args[0]).toBe("id");
  });
});
