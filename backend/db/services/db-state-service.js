const DBState = require("../models/DBState");

const getNumDbVersions = async () => {
  let states = await DBState.find();
  if (states === undefined || states === null) {
    states = [];
  }
  return states.length;
};

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
