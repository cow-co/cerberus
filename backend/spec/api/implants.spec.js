let agent;
const expect = require("chai").expect;
const sinon = require("sinon");
const Implant = require("../../db/models/Implant");
const accessManager = require("../../security/user-and-access-manager");

describe("Implant API Tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    const findStub = sinon.stub(Implant, "find").callsFake(async () => {
      return [
        {
          _id: "some-mongo-id",
          id: "some-uuid",
          ip: "192.168.0.1",
          os: "Windows",
          beaconIntervalSeconds: 300,
          lastCheckinTimeSeconds: 0,
          isActive: true,
        },
        {
          _id: "some-mongo-id",
          id: "some-uuid",
          ip: "192.168.0.1",
          os: "Windows",
          beaconIntervalSeconds: 300,
          lastCheckinTimeSeconds: 0,
          isActive: false,
        },
      ];
    });

    // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
    // since node caches the app
    sinon.stub(accessManager, "verifySession").callsArg(2);
    agent = require("supertest").agent(require("../../index"));
  });
  it("should get all implants (empty array)", async () => {
    sinon.restore();
    sinon.stub(Implant, "find").callsFake(async () => {
      return [];
    });
    const res = await agent.get("/api/implants");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(0);
  });

  it("should get all implants (non-empty array)", async () => {
    server = require("../../index");
    const res = await agent.get("/api/implants");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(2);
  });
});
