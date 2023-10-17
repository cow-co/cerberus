const pki = require("../../security/pki");
const expect = require("chai").expect;

describe("PKI Tests", () => {
  it("should get user details", () => {
    const res = pki.extractUserDetails({
      client: {
        authorized: true,
      },
      socket: {
        getPeerCertificate: () => {
          return {
            subject: {
              CN: "user",
            },
          };
        },
      },
    });
    expect(res).to.equal("user");
  });
});
