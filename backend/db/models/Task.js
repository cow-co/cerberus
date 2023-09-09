const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  order: {
    type: Number,
    min: 0,
    required: true,
  },
  implantId: {
    type: String,
    required: true,
  },
  // TODO Decide whether this is the name or the id of the task type
  taskType: {
    type: String,
    required: true,
  },
  params: {
    type: Array,
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

module.exports = Task = mongoose.model("Task", taskSchema);
