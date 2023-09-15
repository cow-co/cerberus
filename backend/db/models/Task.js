const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  order: {
    type: Number,
    min: 0,
    unique: true,
    dropDups: true,
    required: true,
  },
  implantId: {
    type: String,
    required: true,
  },
  // This is the name, not the ID
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
