const { purgeCache } = require("../../utils");

const dbStateService = require("../../../db/services/db-state-service");
let DBState = require("../../../db/models/DBState");

jest.mock("../../../db/models/DBState");

describe("DB State tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should get the correct number of DB versions", async () => {
    DBState.find.mockResolvedValue([
      {
        version: 1,
        appliedDate: Date.now(),
      },
    ]);

    const numVers = await dbStateService.getNumDbVersions();

    expect(numVers).toBe(1);
  });

  test("should get the correct number of DB versions - no versions", async () => {
    DBState.find.mockResolvedValue(null);

    const numVers = await dbStateService.getNumDbVersions();

    expect(numVers).toBe(0);
  });

  test("should add a new DB version", async () => {
    jest.spyOn(DBState, "find").mockImplementationOnce(() => ({
      sort: () => [],
    }));

    await dbStateService.updateDBVersion();

    const args = DBState.create.mock.calls[0];
    expect(args[0].version).toBe(1);
    expect(args[0].appliedDate).toBeGreaterThan(0);
  });

  test("should add a new DB version - old version present", async () => {
    jest.spyOn(DBState, "find").mockImplementationOnce(() => ({
      sort: () => [
        {
          version: 1,
          appliedDate: 80000,
        },
      ],
    }));

    await dbStateService.updateDBVersion();

    const args = DBState.create.mock.calls[0];
    expect(args[0].version).toBe(2);
    expect(args[0].appliedDate).toBeGreaterThan(0);
  });
});
