const Implant = require("../models/Implant");

const findImplantById = async (id) => {
  let implant = null;
  implant = await Implant.findOne({ id: id });
  return implant;
};

const getAllImplants = async (includeInactive) => {
  let implants = [];
  if (includeInactive === "true") {
    implants = await Implant.find();
  } else {
    implants = await Implant.find({ isActive: true });
  }
  return implants;
};

module.exports = {
  findImplantById,
  getAllImplants,
};
