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
  sessionSecret: `${process.env.CERBERUS_SESSION_SECRET}`,
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
};
