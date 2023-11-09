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
  taskType: {
    type: {
      id: { type: mongoose.SchemaTypes.ObjectId },
      name: { type: String },
    },
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

taskSchema.index({ implantId: 1, order: 1 }, { unique: true });

module.exports = Task = mongoose.model("Task", taskSchema);
