const ACG = require("../../../db/models/ACG");
const acgService = require("../../../db/services/acg-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/ACG");

describe("Admin service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("create ACG - success", async () => {
    ACG.create.mockResolvedValue({ _id: "id", name: "name" });

    const result = await acgService.createACG("name");

    expect(result._id).toBe("id");
  });

  test("create ACG - failure - exception throws out successfully", async () => {
    ACG.create.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await acgService.createACG("name")).rejects.toThrow(
      TypeError
    );
  });

  test("delete ACG - success", async () => {
    ACG.findByIdAndDelete.mockResolvedValue({ _id: "id", name: "name" });

    const result = await acgService.deleteACG("id");

    expect(result._id).toBe("id");
  });

  test("delete ACG - failure - exception throws out successfully", async () => {
    ACG.findByIdAndDelete.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await acgService.deleteACG("id")).rejects.toThrow(
      TypeError
    );
  });

  test("find ACG - success", async () => {
    ACG.findOne.mockResolvedValue({ _id: "id", name: "name" });

    const result = await acgService.findACG("name");

    expect(result._id).toBe("id");
  });

  test("find ACG - success - no result", async () => {
    ACG.findOne.mockResolvedValue(null);

    const result = await acgService.findACG("name");

    expect(result).toBe(null);
  });

  test("find ACG - failure - exception throws out successfully", async () => {
    ACG.findOne.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await acgService.findACG("name")).rejects.toThrow(
      TypeError
    );
  });

  test("find all ACGs - success", async () => {
    ACG.find.mockResolvedValue([
      { _id: "id", name: "name" },
      { _id: "di", name: "name2" },
    ]);

    const result = await acgService.getAllACGs();

    expect(result).toHaveLength(2);
  });

  test("find all ACGs - success - no results", async () => {
    ACG.find.mockResolvedValue([]);

    const result = await acgService.getAllACGs();

    expect(result).toHaveLength(0);
  });

  test("find all ACGs - failure - exception throws out successfully", async () => {
    ACG.find.mockRejectedValue(new TypeError("TEST"));

    expect(async () => await acgService.getAllACGs()).rejects.toThrow(
      TypeError
    );
  });
});
