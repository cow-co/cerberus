const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Implant = require("../db/models/Implant");

let mongod = null;

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

const closeDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

const seedDB = async (withType, numDocs) => {
  switch (withType) {
    case "implants":
      for (let index = 0; index < numDocs; index++) {
        await Implant.create({
          id: `implant-${index}`,
          ip: `192.168.0.${index}`,
          os: "Windows",
          beaconIntervalSeconds: 300,
        });
      }
      break;

    default:
      break;
  }
};

module.exports = {
  connect,
  closeDB,
  clearDB,
  seedDB,
};
