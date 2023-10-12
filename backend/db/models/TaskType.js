const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskTypeSchema = new Schema({
  name: {
    type: String,
    unique: true,
    dropDups: true,
    index: true,
  },
  params: Array,
});

module.exports = TaskType = mongoose.model("TaskType", taskTypeSchema);
