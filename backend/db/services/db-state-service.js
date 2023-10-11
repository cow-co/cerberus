const DBState = require("../models/DBState");

/**
 * Tells us how many database versions there are -
 * mostly used to check if the DB has been seeded yet (in which case, > 0)
 * @returns Number of database versions
 */
const getNumDbVersions = async () => {
  let states = await DBState.find();
  if (states === undefined || states === null) {
    states = [];
  }
  return states.length;
};

/**
 * Increments the database version - useful if we want to change schemas
 * (we could in future potentially tie schemas/task types to specific DB versions)
 */
const updateDBVersion = async () => {
  const states = await DBState.find().sort({ appliedDate: "desc" });
  let mostRecentVer = 0;
  if (states !== undefined && states !== null && states.length > 0) {
    mostRecentVer = states[0].version;
  }

  const newVer = {
    version: mostRecentVer + 1,
    appliedDate: Date.now(),
  };

  await DBState.create(newVer);
};

module.exports = {
  getNumDbVersions,
  updateDBVersion,
};
