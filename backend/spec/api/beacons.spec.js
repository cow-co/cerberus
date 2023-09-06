const request = require("supertest");
const server = require("../../../index");
const expect = require("chai").expect;

describe("Beacon API tests", () => {
  it("should succeed", async () => {
    await request(server).post();
  });
});
