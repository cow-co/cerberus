let validation;
const { purgeCache } = require("../utils");

describe("Password validation tests", () => {
  beforeAll(() => {
    delete require.cache[
      require.resolve("../../validation/security-validation")
    ];
  });

  afterEach(() => {
    delete require.cache[
      require.resolve("../../validation/security-validation")
    ];
  });

  afterAll(() => {
    purgeCache();
  });

  test("should be valid - default config", () => {
    jest.mock("../../config/security-config", () => {
      return {
        passwordRequirements: {
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: true,
          minLength: 15,
        },
      };
    });
    validation = require("../../validation/security-validation");
    const pw = "abcABC123123ABCabc";
    expect(validation.validatePassword(pw)).toHaveLength(0);
  });

  test("should be valid - no-lowercase config", () => {
    jest.mock("../../config/security-config", () => {
      console.log("BLJKHASDGGGGGGGGGGGGGGGGGGGGGGG");
      return {
        passwordRequirements: {
          requireUppercase: true,
          requireLowercase: false,
          requireNumber: true,
          minLength: 15,
        },
      };
    });
    const pw = "ABC123123ABCABC";
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).toHaveLength(0);
  });

  test("should be valid - no-uppercase config", () => {
    const pw = "abc123123abcabc";
    jest.mock("../../config/security-config", () => {
      return {
        passwordRequirements: {
          requireUppercase: false,
          requireLowercase: true,
          requireNumber: true,
          minLength: 15,
        },
      };
    });
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).toHaveLength(0);
  });

  test("should be valid - no-numbers config", () => {
    const pw = "abcABCabcabcabc";
    jest.mock("../../config/security-config", () => {
      return {
        passwordRequirements: {
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: false,
          minLength: 15,
        },
      };
    });
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).toHaveLength(0);
  });

  test("should be valid - shorter length config", () => {
    const pw = "aB1";
    jest.mock("../../config/security-config", () => {
      return {
        passwordRequirements: {
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: true,
          minLength: 2,
        },
      };
    });
    validation = require("../../validation/security-validation");
    expect(validation.validatePassword(pw)).toHaveLength(0);
  });

  test("should be invalid - no lower", () => {
    const pw = "ABCABC123123ABCABC";
    expect(validation.validatePassword(pw)).toHaveLength(1);
  });

  test("should be invalid - no upper", () => {
    const pw = "abc123123abcabc";
    expect(validation.validatePassword(pw)).toHaveLength(1);
  });

  test("should be invalid - no numbers", () => {
    const pw = "abcABCABCabcabc";
    expect(validation.validatePassword(pw)).toHaveLength(1);
  });

  test("should be invalid - too short", () => {
    const pw = "abcABC111abc";
    expect(validation.validatePassword(pw)).toHaveLength(1);
  });
});
