let agent;
let server;
const { purgeCache } = require("../utils");

const implantService = require("../../db/services/implant-service");
const accessManager = require("../../security/user-and-access-manager");

describe("Implant API Tests", () => {
  afterEach(() => {
    sinon.restore();
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    spyOn(accessManager, "verifySession").and.callFake((req, res, next) => {
      next();
    });
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should get all implants (empty array)", async () => {
    spyOn(implantService, "getAllImplants").and.resolveTo([]);
    const res = await agent.get("/api/implants");
    expect(res.statusCode).toBe(200);
    expect(res.body.implants.length).toBe(0);
  });

  test("should get all implants (non-empty array)", async () => {
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
    expect(res.statusCode).toBe(200);
    expect(res.body.implants.length).toBe(2);
  });

  test("should fail to get all implants - exception thrown", async () => {
    spyOn(implantService, "getAllImplants").and.throwError("TypeError");
    const res = await agent.get("/api/implants");
    expect(res.statusCode).toBe(500);
  });
});
