const MONGO_STRING = encodeURIComponent(process.env.CERBERUS_DB_STRING);

module.exports = {
  mongo_uri: `${MONGO_STRING}`,
};
