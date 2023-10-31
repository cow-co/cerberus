const Implant = require("../../../db/models/Implant");
const implantService = require("../../../db/services/implant-service");
const { purgeCache } = require("../../utils");

jest.mock("../../../db/models/Implant");

describe("Implant service tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("add implant - success", async () => {
    await implantService.addImplant({
      id: "details.id",
      ip: "details.ip",
      os: "details.os",
      beaconIntervalSeconds: 500,
      lastCheckinTimeSeconds: 1,
    });

    const args = Implant.create.mock.calls[0];
    expect(Implant.create).toHaveBeenCalledTimes(1);
    expect(args[0].isActive).toBe(true);
  });

  test("update implant - success", async () => {
    await implantService.updateImplant({
      id: "details.id",
      ip: "details.ip",
      os: "details.os",
      beaconIntervalSeconds: 500,
      lastCheckinTimeSeconds: 1,
    });

    const args = Implant.findOneAndUpdate.mock.calls[0];
    expect(Implant.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(args[0].id).toBe("details.id");
    expect(args[1].isActive).toBe(true);
  });

  test("find implant - success", async () => {
    Implant.findOne.mockResolvedValue({
      id: "details.id",
      ip: "details.ip",
      os: "details.os",
      beaconIntervalSeconds: 500,
      lastCheckinTime: 1,
      isActive: true,
    });

    const imp = await implantService.findImplantById("details.id");

    expect(Implant.findOne).toHaveBeenCalledTimes(1);
    expect(imp.id).toBe("details.id");
    expect(imp.lastCheckinTime).toBe(1);
  });

  test("get all implants - success", async () => {
    Implant.find.mockResolvedValue([
      {
        id: "details.id",
        ip: "details.ip",
        os: "details.os",
        beaconIntervalSeconds: 500,
        lastCheckinTime: 1,
        isActive: true,
      },
    ]);

    const imps = await implantService.getAllImplants();

    expect(Implant.find).toHaveBeenCalledTimes(1);
    expect(imps).toHaveLength(1);
  });
});
