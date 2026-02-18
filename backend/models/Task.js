const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    dueDate: Date,
    status: {
      type: String,
      enum: [
        "NEW",
        "NOT_STARTED",
        "IN_PROGRESS",
        "BLOCKED",
        "COMPLETED"
      ],
      default: "NEW"
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
