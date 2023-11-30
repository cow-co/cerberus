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
      lastCheckinTime: 1,
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
      lastCheckinTime: 1,
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

  test("delete implant - success", async () => {
    Implant.findOneAndDelete.mockResolvedValue(null);

    await implantService.deleteImplant("id");

    const args = Implant.findOneAndDelete.mock.calls[0];
    expect(Implant.findOneAndDelete).toHaveBeenCalledTimes(1);
    expect(args[0]).toEqual({ id: "id" });
  });

  test("activity checker - should deactivate an implant", async () => {
    let updates = {
      id1: true,
      id2: true,
      id3: true,
    };

    Implant.find.mockResolvedValue([
      {
        id: "id1",
        ip: "details.ip",
        os: "details.os",
        beaconIntervalSeconds: 500,
        lastCheckinTime: Number.MAX_SAFE_INTEGER,
        isActive: true,
        save: async function () {
          updates.id1 = this.isActive;
        },
      },
      {
        id: "id2",
        ip: "details.ip",
        os: "details.os",
        beaconIntervalSeconds: 500,
        lastCheckinTime: 1698862658,
        isActive: true,
        save: async function () {
          updates.id2 = this.isActive;
        },
      },
      {
        id: "id3",
        ip: "details.ip",
        os: "details.os",
        beaconIntervalSeconds: 500,
        lastCheckinTime: 1698861658,
        isActive: true,
        save: async function () {
          updates.id3 = this.isActive;
        },
      },
    ]);

    await implantService.checkActivity();

    expect(updates.id1).toBe(true);
    expect(updates.id2).toBe(false);
    expect(updates.id3).toBe(false);
  });

  test("Update ACGs", async () => {
    let called = false;
    Implant.findOne.mockResolvedValue({
      _id: "id",
      id: "implantId",
      readOnlyACGs: ["group 1"],
      operatorACGs: ["group 2"],
      save: async function () {
        called = true;
      },
    });

    const result = await implantService.updateACGs(
      "implantId",
      ["group 3"],
      ["group 2", "group 4"]
    );

    expect(result.readOnlyACGs).toHaveLength(1);
    expect(result.operatorACGs).toHaveLength(2);
    expect(result.readOnlyACGs[0]).toBe("group 3");
    expect(called).toBe(true);
  });
});
