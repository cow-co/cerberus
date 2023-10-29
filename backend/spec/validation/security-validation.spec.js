let config;
let validation;
const expect = require("chai").expect;

describe("Password validation tests", () => {
  afterEach(() => {
    delete require.cache[require.resolve("../../config/security-config")];
    delete require.cache[
      require.resolve("../../validation/security-validation")
    ];
  });
  beforeEach(() => {
    config = require("../../config/security-config");
    config.passwordRequirements = {
      requireLowercase: true,
      requireUppercase: true,
      requireNumber: true,
      minLength: 15,
    };
  });

  it("should be valid - default config", () => {
    validation = require("../../validation/security-validation");
    const pw = "abcABC123123ABCabc";
    expect(validation.validatePassword(pw)).to.be.empty;
  });

  it("should be valid - no-lowercase config", () => {
    const pw = "ABC123123ABCABC";
    config.passwordRequirements.requireLowercase = false;
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).to.be.empty;
  });

  it("should be valid - no-uppercase config", () => {
    const pw = "abc123123abcabc";
    config.passwordRequirements.requireUppercase = false;
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).to.be.empty;
  });

  it("should be valid - no-numbers config", () => {
    const pw = "abcABCabcabcabc";
    config.passwordRequirements.requireNumber = false;
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).to.be.empty;
  });

  it("should be valid - shorter length config", () => {
    const pw = "aB1";
    config.passwordRequirements.minLength = 2;
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).to.be.empty;
  });

  it("should be invalid - no lower", () => {
    const pw = "ABCABC123123ABCABC";
    expect(validation.validatePassword(pw)).to.not.be.empty;
  });

  it("should be invalid - no upper", () => {
    const pw = "abc123123abcabc";
    expect(validation.validatePassword(pw)).to.not.be.empty;
  });

  it("should be invalid - no numbers", () => {
    const pw = "abcABCABCabcabc";
    expect(validation.validatePassword(pw)).to.not.be.empty;
  });

  it("should be invalid - too short", () => {
    const pw = "abcABCabc";
    expect(validation.validatePassword(pw)).to.not.be.empty;
  });
});
