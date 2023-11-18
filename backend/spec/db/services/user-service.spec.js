const User = require("../../../db/models/User");
const HashedPassword = require("../../../db/models/HashedPassword");
const TokenValidity = require("../../../db/models/TokenValidity");
const userService = require("../../../db/services/user-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/User");
jest.mock("../../../db/models/HashedPassword");
jest.mock("../../../db/models/TokenValidity");

describe("User service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("find user", async () => {
    User.findOne.mockResolvedValue({
      _id: "id",
      name: "user",
    });

    const user = await userService.findUserByName("user");

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
    await userService.createUser("user", "pass");

    const userArgs = User.create.mock.calls[0];
    const passArgs = HashedPassword.create.mock.calls[0];

    expect(userArgs[0].name).toBe("user");
    expect(passArgs[0].hashedPassword).toBe("pass");
  });

  test("delete user", async () => {
    let called = false;
    User.findById.mockResolvedValue({
      _id: "id",
      name: "user",
      deleteOne: async function () {
        called = true;
      },
    });
    await userService.deleteUser("id");

    expect(called).toBe(true);
    expect(HashedPassword.findByIdAndDelete).toHaveBeenCalledTimes(1);
    expect(TokenValidity.findOneAndDelete).toHaveBeenCalledTimes(1);
  });

  test("Get min token timestamp - success", async () => {
    TokenValidity.findOne.mockResolvedValue({
      _id: "id2",
      userId: "id",
      minTokenValidity: 100,
    });

    const res = await userService.getMinTokenTimestamp("id");

    expect(res).toBe(100);
  });

  test("Get min token timestamp - validity not found", async () => {
    TokenValidity.findOne.mockResolvedValue(null);

    const res = await userService.getMinTokenTimestamp("id");

    expect(res).toBe(0);
  });
});
