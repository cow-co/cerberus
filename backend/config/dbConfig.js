let mongoString = "";
if (process.env.CERBERUS_DB_USER) {
  mongoString = `mongodb://${process.env.CERBERUS_DB_USER}:${process.env.CERBERUS_DB_PASS}@127.0.0.1:27017/cerberus`;
} else {
  mongoString = `mongodb://127.0.0.1:27017/cerberus`;
}

module.exports = {
  mongo_uri: mongoString,
};
