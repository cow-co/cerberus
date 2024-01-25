const { purgeCache } = require("../utils");
const validation = require("../../validation/config-validation");

const baseline = {
  jwtSecret: "secret",
  passwordRequirements: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: false,
    minLength: 1,
  },
  initialAdmin: {
    username: "user",
    password: "pass",
  },
};

describe("Config validation tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("security config validation - success", () => {
    const securityConfig = { ...baseline };

    expect(
      validation.validateSecurityConfig(securityConfig).isValid
    ).toBeTruthy();
    expect(
      validation.validateSecurityConfig(securityConfig).errors
    ).toHaveLength(0);
  });

  test("security config validation - failure - no JWT secret", () => {
    const securityConfig = { ...baseline };
    securityConfig.jwtSecret = "";

    expect(
      validation.validateSecurityConfig(securityConfig).isValid
    ).toBeFalsy();
    expect(
      validation.validateSecurityConfig(securityConfig).errors
    ).toHaveLength(1);
  });

  test("security config validation - failure - no password requirements", () => {
    const securityConfig = { ...baseline };
    securityConfig.passwordRequirements = undefined;

    expect(
      validation.validateSecurityConfig(securityConfig).isValid
    ).toBeFalsy();
    expect(
      validation.validateSecurityConfig(securityConfig).errors
    ).toHaveLength(1);
  });

  test("security config validation - failure - empty initial admin username", () => {
    const securityConfig = { ...baseline };
    securityConfig.initialAdmin.username = "";

    expect(
      validation.validateSecurityConfig(securityConfig).isValid
    ).toBeFalsy();
    expect(
      validation.validateSecurityConfig(securityConfig).errors
    ).toHaveLength(1);
  });

  test("security config validation - failure - empty initial admin password", () => {
    const securityConfig = { ...baseline };
    securityConfig.initialAdmin.password = "";

    expect(
      validation.validateSecurityConfig(securityConfig).isValid
    ).toBeFalsy();
    expect(
      validation.validateSecurityConfig(securityConfig).errors
    ).toHaveLength(1);
  });
});
