const expect = require("chai").expect;
const sinon = require("sinon");
const dbStateService = require("../../../db/services/db-state-service");
const DBState = require("../../../db/models/DBState");

describe("DB State tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get the correct number of DB versions", async () => {
    spyOn(DBState, "find").and.returnValue([
      {
        version: 1,
        appliedDate: Date.now(),
      },
    ]);
    const numVers = await dbStateService.getNumDbVersions();
    expect(numVers).to.equal(1);
  });

  it("should get the correct number of DB versions - no versions", async () => {
    spyOn(DBState, "find").and.returnValue(null);
    const numVers = await dbStateService.getNumDbVersions();
    expect(numVers).to.equal(0);
  });

  it("should add a new DB version", async () => {
    spyOn(DBState, "find").and.returnValue({
      sort: () => {
        return [];
      },
    });
    spyOn(Date, "now").and.returnValue(86400);
    const createStub = spyOn(DBState, "create");

    await dbStateService.updateDBVersion();
    const arg = createStub.calls.mostRecent().args[0];
    expect(arg).to.deep.equal({ version: 1, appliedDate: 86400 });
  });

  it("should add a new DB version - old version present", async () => {
    spyOn(DBState, "find").and.returnValue({
      sort: () => {
        return [
          {
            version: 1,
            appliedDate: 80000,
          },
        ];
      },
    });
    spyOn(Date, "now").and.returnValue(86400);
    const createStub = spyOn(DBState, "create");

    await dbStateService.updateDBVersion();
    const arg = createStub.calls.mostRecent().args[0];
    expect(arg).to.deep.equal({ version: 2, appliedDate: 86400 });
  });
});
