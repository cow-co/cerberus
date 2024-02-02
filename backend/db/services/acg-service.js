const ACG = require("../models/ACG");
const {
  entityTypes,
  eventTypes,
  sendMessage,
} = require("../../utils/web-sockets");

// Very shallow interface here, but I think it makes sense, just to logically
// keep the handling of ACGs in line with the handling of other database entities.
// Also ensures the access managers don't need to go direct to the DB

const createACG = async (name) => {
  let result = null;
  if (name) {
    result = await ACG.create({
      name: name,
    });
    sendMessage(entityTypes.GROUPS, eventTypes.CREATE, result);
  }
  return result;
};

const deleteACG = async (id) => {
  let result = await ACG.findByIdAndDelete(id);
  if (result._id) {
    sendMessage(entityTypes.GROUPS, eventTypes.DELETE, result);
  }
  return result;
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
