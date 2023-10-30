const { purgeCache } = require("../../utils");

const dbStateService = require("../../../db/services/db-state-service");
const DBState = require("../../../db/models/DBState");

jest.mock(DBState);
jest.mock(Date);

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
    DBState.find.mockResolvedValue({
      sort: () => {
        return [];
      },
    });
    Date.now.mockReturnValue(86400);

    await dbStateService.updateDBVersion();
    const args = DBState.create.mock.calls[0];
    expect(args[0]).toEqual({ version: 1, appliedDate: 86400 });
  });

  test("should add a new DB version - old version present", async () => {
    DBState.find.mockResolvedValue({
      sort: () => {
        return [
          {
            version: 1,
            appliedDate: 80000,
          },
        ];
      },
    });
    Date.now.mockReturnValue(86400);

    await dbStateService.updateDBVersion();
    const args = DBState.create.mock.calls[0];
    expect(args[0]).toEqual({ version: 2, appliedDate: 86400 });
  });
});
