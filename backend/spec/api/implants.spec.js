let agent;
let server;
const expect = require("chai").expect;
const sinon = require("sinon");
const implantService = require("../../db/services/implant-service");
const accessManager = require("../../security/user-and-access-manager");

describe("Implant API Tests", () => {
  afterEach(() => {
    sinon.restore();
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  beforeEach(() => {
    server = require("../../index");
    // We have to stub this middleware on each test suite, otherwise we get cross-contamination into the other suites,
    // since node caches the app
    sinon.stub(accessManager, "verifySession").callsArg(2);
  });

  it("should get all implants (empty array)", async () => {
    spyOn(implantService, "getAllImplants").and.resolveTo([]);
    const res = await agent.get("/api/implants");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(0);
  });

  it("should get all implants (non-empty array)", async () => {
    spyOn(implantService, "getAllImplants").and.resolveTo([
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
    ]);
    const res = await agent.get("/api/implants");
    expect(res.statusCode).to.equal(200);
    expect(res.body.implants.length).to.equal(2);
  });

  it("should fail to get all implants - exception thrown", async () => {
    spyOn(implantService, "getAllImplants").and.throwError("TypeError");
    const res = await agent.get("/api/implants");
    expect(res.statusCode).to.equal(500);
  });
});
