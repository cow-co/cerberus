// Handles the connection(s) to the database itself
const {Sequelize} = require("sequelize");
let config = require("../config/config-dev");
if(process.env.NODE_ENV === "production") {
  config = require("../config/config");
}

const initialise = async () => {
  if(config.dbEnabled) {
    const sequelize = new Sequelize(dbUrl, {logging: false});
    try {
      await sequelize.authenticate();
      console.info("Connected to the DB");
    } catch(err) {
      console.error("Unable to connect to the database: ", err);
    }
  } else {
    console.info("DB is disabled in config. Skipping connection to DB.");
  }  
}

module.exports = initialise;
