const authMethods = {
  DB: "database",
  AD: "activedirectory",
};

module.exports = {
  // If true, then mutual TLS will be enforced. The DN from the client cert
  // will be used instead of a username/password (the login functionality will simply be pass-through)
  usePKI: false,
  authMethod: authMethods.DB,
  availableAuthMethods: authMethods,
  jwtSecret: `${process.env.CERBERUS_JWT_SECRET}`,
  passwordRequirements: {
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    minLength: 15,
  },
  adConfig: {
    url: "",
    baseDN: "",
    username: `${process.env.CERBERUS_LDAP_BIND_USER}`,
    password: `${process.env.CERBERUS_LDAP_BIND_PASS}`,
    adminGroup: "",
  },
  initialAdmin: {
    username: `${process.env.CERBERUS_INIT_ADMIN_USER}`,
    password: `${process.env.CERBERUS_INIT_ADMIN_PASS}`,
  },
  certType: "PFX",
  certFile: "../powershellcert.pfx",
  certPassword: "password1234",
  rateLimit: {
    windowTimeMS: 15 * 60 * 1000, // The timespan over which the rate is taken
    maxRequestsInWindow: 100, // How many requests can each IP make, per window
  },
};
