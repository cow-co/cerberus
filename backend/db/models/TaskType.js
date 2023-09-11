const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskTypeSchema = new Schema({
  name: String,
  params: Array,
});

module.exports = TaskType = mongoose.model("TaskType", taskTypeSchema);
