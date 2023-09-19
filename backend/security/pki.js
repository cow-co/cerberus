const { levels, log } = require("../utils/logger");

const extractCertDetails = (req) => {
  const clientCert = req.socket.getPeerCertificate();
  let username = null;

  if (req.client.authorized) {
    username = clientCert.subject.CN;
  } else {
    log(
      "extractCertDetails",
      "PKI Certificate Authentication Failed - Cert rejected",
      levels.WARN
    );
  }

  return username;
};

module.exports = {
  extractCertDetails,
};
