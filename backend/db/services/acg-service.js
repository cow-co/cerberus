const ACG = require("../models/ACG");

const createACG = async (name) => {
  return await ACG.create({
    name: name,
  });
};

const deleteACG = async (id) => {
  await ACG.findByIdAndDelete(id);
};

const findACG = async (name) => {
  let acg = null;

  if (name) {
    acg = await ACG.findOne({ name: name });
  }

  return acg;
};

const getAllACGs = async () => {
  let acgs = await ACG.find();
  return acgs;
}

module.exports = {
  createACG,
  deleteACG,
  findACG,
  getAllACGs
};
