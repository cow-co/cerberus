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
};
