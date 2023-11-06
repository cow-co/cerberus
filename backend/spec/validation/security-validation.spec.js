const { purgeCache } = require("../utils");
const validation = require("../../validation/security-validation");

let reqs = null;

describe("Password validation tests", () => {
  beforeEach(() => {
    reqs = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      minLength: 15,
    };
  });

  afterAll(() => {
    purgeCache();
  });

  test("should be valid - default config", () => {
    const pw = "abcABC123123ABCabc";

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("should be valid - no-lowercase config", () => {
    const reqs = {
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      minLength: 15,
    };
    const pw = "ABC123123ABCABC";

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("should be valid - no-uppercase config", () => {
    const pw = "abc123123abcabc";
    const reqs = {
      requireUppercase: false,
      requireLowercase: true,
      requireNumber: true,
      minLength: 15,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("should be valid - no-numbers config", () => {
    const pw = "abcABCabcabcabc";
    const reqs = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: false,
      minLength: 15,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("should be valid - shorter length config", () => {
    const pw = "aB1";
    const reqs = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      minLength: 2,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("should be invalid - no lower", () => {
    const pw = "ABCABC123123ABCABC";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("should be invalid - no upper", () => {
    const pw = "abc123123abcabc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("should be invalid - no numbers", () => {
    const pw = "abcABCABCabcabc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("should be invalid - too short", () => {
    const pw = "abcABC111abc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });
});
