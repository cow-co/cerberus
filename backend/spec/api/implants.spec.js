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
    accessManager.verifyToken.mockImplementation((req, res, next) => {
      req.data = {
        userId: "id",
      };
      next();
    });
    accessManager.authZCheck.mockResolvedValue(true);
    server = require("../../index");
    agent = require("supertest").agent(server);
  });

  test("get all implants - success - empty array", async () => {
    implantService.getAllImplants.mockResolvedValue([]);
    accessManager.filterImplantsForView.mockResolvedValue({
      filtered: [],
      errors: [],
    });

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(200);
    expect(res.body.implants).toHaveLength(0);
  });

  test("get all implants - success - non-empty array, admin user", async () => {
    implantService.getAllImplants.mockResolvedValue([
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalSeconds: 300,
        lastCheckinTime: 0,
        isActive: true,
      },
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalSeconds: 300,
        lastCheckinTime: 0,
        isActive: false,
      },
    ]);
    accessManager.filterImplantsForView.mockResolvedValue({
      filtered: [
        {
          _id: "some-mongo-id",
          id: "some-uuid",
          ip: "192.168.0.1",
          os: "Windows",
          beaconIntervalSeconds: 300,
          lastCheckinTime: 0,
          isActive: true,
        },
        {
          _id: "some-mongo-id",
          id: "some-uuid",
          ip: "192.168.0.1",
          os: "Windows",
          beaconIntervalSeconds: 300,
          lastCheckinTime: 0,
          isActive: false,
        },
      ],
      errors: [],
    });

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(200);
    expect(res.body.implants).toHaveLength(2);
  });

  test("get all implants - success - non-empty array, some filtered", async () => {
    implantService.getAllImplants.mockResolvedValue([
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalSeconds: 300,
        lastCheckinTime: 0,
        isActive: true,
      },
      {
        _id: "some-mongo-id",
        id: "some-uuid",
        ip: "192.168.0.1",
        os: "Windows",
        beaconIntervalSeconds: 300,
        lastCheckinTime: 0,
        isActive: false,
      },
    ]);
    accessManager.filterImplantsForView.mockResolvedValue({
      filtered: [
        {
          _id: "some-mongo-id",
          id: "some-uuid",
          ip: "192.168.0.1",
          os: "Windows",
          beaconIntervalSeconds: 300,
          lastCheckinTime: 0,
          isActive: true,
        },
      ],
      errors: [],
    });

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(200);
    expect(res.body.implants).toHaveLength(1);
  });

  test("get all implants - failure - exception thrown", async () => {
    implantService.getAllImplants.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.get("/api/implants");

    expect(res.statusCode).toBe(500);
  });

  test("delete implant - success", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "_id1",
      implantId: "id1",
    });

    const res = await agent.delete("/api/implants/id1");

    expect(res.statusCode).toBe(200);
    expect(implantService.deleteImplant).toHaveBeenCalledTimes(1);
  });

  test("delete implant - success - non-existent ID", async () => {
    implantService.findImplantById.mockResolvedValue(null);

    const res = await agent.delete("/api/implants/id2");

    expect(res.statusCode).toBe(200);
    expect(implantService.deleteImplant).toHaveBeenCalledTimes(0);
  });

  test("delete implant - failure - not permitted", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "_id1",
      implantId: "id1",
    });
    accessManager.authZCheck.mockResolvedValue(false);

    const res = await agent.delete("/api/implants/id1");

    expect(res.statusCode).toBe(403);
    expect(implantService.deleteImplant).toHaveBeenCalledTimes(0);
  });

  test("delete implant - failure - exception", async () => {
    implantService.findImplantById.mockResolvedValue({
      _id: "_id3",
      implantId: "id3",
    });
    implantService.deleteImplant.mockRejectedValue(new TypeError("TEST"));

    const res = await agent.delete("/api/implants/id3");

    expect(res.statusCode).toBe(500);
  });
});
