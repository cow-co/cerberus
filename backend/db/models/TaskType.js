const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO Uniqueness constraint on the param names within a given task type
// TODO Set name as an index field
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
