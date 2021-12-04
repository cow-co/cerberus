const expect = require("chai").expect;
const request = require("supertest");
const server = require("../../../../app");

describe("Beacon endpoint tests", () => {
    it("should respend with 200 to a properly-formatted beacon", async () => {
        const beaconRes = await request(server).post("/api/v1/imp/beacon").send({id: 101, password: "password1"});
        expect(beaconRes.status).to.equal(200);
    });
    it("should return 400 for an improperly-formatted request", async () => {
        const beaconRes = await request(server).post("/api/v1/imp/beacon").send({id: 102, password: "password1"});
        expect(beaconRes.status).to.equal(400);
    });
    it("should return 403 for an incorrect password", async () => {
        const beaconRes = await request(server).post("/api/v1/imp/beacon").send({id: 102, password: "password2"});
        expect(beaconRes.status).to.equal(403);
    });
    it("should return 403 for a missing password", async () => {
        const beaconRes = await request(server).post("/api/v1/imp/beacon").send({id: 102});
        expect(beaconRes.status).to.equal(403);
    });
});