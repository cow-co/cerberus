const Implant = require("../models/Implant");

const findImplantById = async (id) => {
  let implant = null;
  implant = await Implant.findOne({ id: id });
  return implant;
};

const getAllImplants = async () => {
  let implants = [];
  implants = Implant.find();
  return implants;
};

module.exports = {
  findImplantById,
  getAllImplants,
};
