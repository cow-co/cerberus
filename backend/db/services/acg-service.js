const ACG = require("../models/ACG");

// Very shallow interface here, but I think it makes sense, just to logically
// keep the handling of ACGs in line with the handling of other database entities.
// Also ensures the access managers don't need to go direct to the DB

const createACG = async (name) => {
  let result = null;
  if (name) {
    result = await ACG.create({
      name: name,
    });
  }
  return result;
};

const deleteACG = async (id) => {
  return await ACG.findByIdAndDelete(id);
};

const findACG = async (name) => {
  let result = null;
  if (name) {
    result = await ACG.findOne({ name: name });
  }
  return result;
};

const getAllACGs = async () => {
  return await ACG.find();
};

module.exports = {
  createACG,
  deleteACG,
  findACG,
  getAllACGs,
};
