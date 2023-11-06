const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskTypeSchema = new Schema({
  name: {
    type: String,
    unique: true,
    dropDups: true,
    index: true,
  },
  params: [
    {
      name: String,
      type: {
        type: String,
        enum: ["NUMBER", "STRING"],
        default: "STRING",
      },
    },
  ],
});

module.exports = TaskType = mongoose.model("TaskType", taskTypeSchema);
