const expect = require("chai").expect;
const sinon = require("sinon");
const dbStateService = require("../../../db/services/db-state-service");
const DBState = require("../../../db/models/DBState");

//TODO Migrate these
describe("DB State tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get the correct number of DB versions", async () => {
    sinon.stub(DBState, "find").returns([
      {
        version: 1,
        appliedDate: Date.now(),
      },
    ]);
    const numVers = await dbStateService.getNumDbVersions();
    expect(numVers).to.equal(1);
  });

  it("should get the correct number of DB versions - no versions", async () => {
    sinon.stub(DBState, "find").returns(null);
    const numVers = await dbStateService.getNumDbVersions();
    expect(numVers).to.equal(0);
  });

  it("should add a new DB version", async () => {
    sinon.stub(DBState, "find").returns({
      sort: () => {
        return [];
      },
    });
    sinon.stub(Date, "now").returns(86400);
    const createStub = sinon.stub(DBState, "create");

    await dbStateService.updateDBVersion();
    expect(createStub.calledWithExactly({ version: 1, appliedDate: 86400 })).to
      .be.true;
  });

  it("should add a new DB version - old version present", async () => {
    sinon.stub(DBState, "find").returns({
      sort: () => {
        return [
          {
            version: 1,
            appliedDate: 80000,
          },
        ];
      },
    });
    sinon.stub(Date, "now").returns(86400);
    const createStub = sinon.stub(DBState, "create");

    await dbStateService.updateDBVersion();
    expect(createStub.calledWithExactly({ version: 2, appliedDate: 86400 })).to
      .be.true;
  });
});
