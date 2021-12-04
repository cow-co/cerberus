// Handles the connection(s) to the database itself
const {Sequelize} = require("sequelize");
const { dbUrl } = require("../config/config");


const initialise = async () => {
  const sequelize = new Sequelize(dbUrl, {logging: false});
  try {
    await sequelize.authenticate();
    console.info("Connected to the DB");
  } catch(err) {
    console.error("Unable to connect to the database: ", err);
  }
}

module.exports = initialise;
