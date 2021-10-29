const expect = require("chai").expect;
const request = require("supertest");
const server = require("../../../../app");

describe("Beacon endpoint tests", () => {
    it("should respend with 200 to a properly-formatted beacon", async () => {
        const beaconRes = await request(server).post("/api/v1/imp/beacon").send({id: 101});
        expect(beaconRes.status).to.equal(200);
    });
});