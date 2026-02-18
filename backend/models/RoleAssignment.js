const mongoose = require("mongoose");

const roleAssignmentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "TASK_TRACKER", "READ_ONLY"],
    required: true
  }
});

module.exports = mongoose.model("RoleAssignment", roleAssignmentSchema);
