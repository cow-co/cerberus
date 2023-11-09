let agent;
let server;
const { purgeCache } = require("../utils");

const implantService = require("../../db/services/implant-service");
const accessManager = require("../../security/user-and-access-manager");

jest.mock("../../db/services/implant-service");
jest.mock("../../security/user-and-access-manager");

describe("Implant API Tests", () => {
  afterEach(() => {
    server.stop();
    delete require.cache[require.resolve("../../index")];
  });

  afterAll(() => {
    purgeCache();
  });

  beforeEach(() => {
    accessManager.verifySession.mockImplementation((req, res, next) => {
      next();
    });
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("should get all implants (empty array)", async () => {
    implantService.getAllImplants.mockResolvedValue([]);

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(200);
    expect(res.body.implants).toHaveLength(0);
  });

  test("should get all implants (non-empty array)", async () => {
    implantService.getAllImplants.mockResolvedValue([
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalMS: 300,
        lastCheckinTime: 0,
        isActive: true,
      },
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalMS: 300,
        lastCheckinTime: 0,
        isActive: false,
      },
    ]);

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(200);
    expect(res.body.implants).toHaveLength(2);
  });

  test("should fail to get all implants - exception thrown", async () => {
    implantService.getAllImplants.mockRejectedValue(new Error("TypeError"));

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(500);
  });
});
