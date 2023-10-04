const { levels, log } = require("../utils/logger");

const extractUserDetails = (req) => {
  const clientCert = req.socket.getPeerCertificate();
  let username = null;

  if (req.client.authorized) {
    username = clientCert.subject.CN;
  } else {
    log(
      "extractUserDetails",
      "PKI Certificate Authentication Failed - Cert rejected",
      levels.WARN
    );
  }

  return username;
};

module.exports = {
  extractUserDetails,
};
