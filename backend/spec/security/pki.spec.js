const pki = require("../../security/pki");
const { purgeCache } = require("../utils");
const expect = require("chai").expect;

describe("PKI Tests", () => {
  afterAll(() => {
    purgeCache();
  });

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

  it("should fail with untrusted cert", () => {
    const res = pki.extractUserDetails({
      client: {
        authorized: false,
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
    expect(res).to.equal(null);
  });
});
