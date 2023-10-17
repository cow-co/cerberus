const securityConfig = require("../../config/security-config");
const pki = require("../../security/pki");
const accessManager = require("../../security/user-and-access-manager");
const dbManager = require("../../security/database-manager");
const expect = require("chai").expect;

describe("Access Manager tests", () => {
  it("should handle PKI authentication properly", async () => {
    securityConfig.usePKI = true;
    const pkiCall = spyOn(pki, "extractUserDetails").and.returnValue("user");
    spyOn(dbManager, "authenticate").and.returnValue(true);
    let called = false;
    await accessManager.authenticate(
      {
        session: {},
      },
      null,
      () => {
        called = true;
      }
    );
    expect(called).to.be.true;
    expect(pkiCall.calls.count()).to.equal(1);
    securityConfig.usePKI = false;
  });

  it("should handle authentication exception properly", async () => {
    spyOn(dbManager, "authenticate").and.throwError("TypeError");
    let called = false;
    let resStatus = 200;
    let res = {};
    accessManager.authenticate(
      {
        body: {
          username: "ksdah",
          password: "kjsdahf",
        },
      },
      {
        status: (status) => {
          resStatus = status;
          return {
            json: (data) => {
              res = data;
            },
          };
        },
      },
      () => {
        called = true;
      }
    );
    expect(called).to.be.false;
    expect(resStatus).to.equal(500);
    expect(res.errors.length).to.equal(1);
  });

  it("should handle check-admin user missing properly", async () => {});
});
