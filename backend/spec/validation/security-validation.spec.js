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

  test("Password validation - success - default config", () => {
    const pw = "abcABC123123ABCabc";

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("Password validation - success - no-lowercase config", () => {
    const reqs = {
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      minLength: 15,
    };
    const pw = "ABC123123ABCABC";

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("Password validation - success - no-uppercase config", () => {
    const pw = "abc123123abcabc";
    const reqs = {
      requireUppercase: false,
      requireLowercase: true,
      requireNumber: true,
      minLength: 15,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("Password validation - success - no-numbers config", () => {
    const pw = "abcABCabcabcabc";
    const reqs = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: false,
      minLength: 15,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("Password validation - success - shorter length config", () => {
    const pw = "aB1";
    const reqs = {
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      minLength: 2,
    };

    expect(validation.validatePassword(pw, reqs)).toHaveLength(0);
  });

  test("Password validation - failure - no lower", () => {
    const pw = "ABCABC123123ABCABC";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("Password validation - failure - no upper", () => {
    const pw = "abc123123abcabc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("Password validation - failure - no numbers", () => {
    const pw = "abcABCABCabcabc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });

  test("Password validation - failure - too short", () => {
    const pw = "abcABC111abc";
    expect(validation.validatePassword(pw, reqs)).toHaveLength(1);
  });
});

describe("Username validation tests", () => {
  afterAll(() => {
    purgeCache();
  });

  test("Username validation - success - all letters", () => {
    const name = "aAaAa";

    expect(validation.validateUsername(name)).toHaveLength(0);
  });

  test("Username validation - success - all numbers", () => {
    const name = "12345";

    expect(validation.validateUsername(name)).toHaveLength(0);
  });

  test("Username validation - success - all hyphens", () => {
    const name = "-----";

    expect(validation.validateUsername(name)).toHaveLength(0);
  });

  test("Username validation - success - all underscores", () => {
    const name = "_____";

    expect(validation.validateUsername(name)).toHaveLength(0);
  });

  test("Username validation - failure - a space", () => {
    const name = "user name";

    expect(validation.validateUsername(name)).toHaveLength(1);
  });

  test("Username validation - failure - a disallowed symbol", () => {
    const name = "user^name";

    expect(validation.validateUsername(name)).toHaveLength(1);
  });

  test("Username validation - failure - a non-latin character", () => {
    const name = "ГhelloГ";

    expect(validation.validateUsername(name)).toHaveLength(1);
  });

  test("Username validation - failure - an accented character", () => {
    const name = "aaéaa";

    expect(validation.validateUsername(name)).toHaveLength(1);
  });

  test("Username validation - failure - too long", () => {
    const name = "A".repeat(65);

    expect(validation.validateUsername(name)).toHaveLength(1);
  });

  test("Username validation - failure - zero length", () => {
    const name = "";

    expect(validation.validateUsername(name)).toHaveLength(1);
  });
});
