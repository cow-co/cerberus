const pki = require("../../security/pki");
const { purgeCache } = require("../utils");

describe("PKI Tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("should get user details", () => {
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
    expect(res).toBe("user");
  });

  test("should fail with untrusted cert", () => {
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
    expect(res).toBeNull();
  });
});
