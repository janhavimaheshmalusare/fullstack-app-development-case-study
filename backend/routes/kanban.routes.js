const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");

const Task = require("../models/Task");

router.get("/tasks", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const tasks = await Task.find({ owner: userId })
      .populate("owner", "email role")
      .populate("project", "name");

    res.json(tasks);

  } catch (err) {
    console.error("KANBAN FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch kanban tasks" });
  }
});

router.put("/tasks/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("owner", "email role")
      .populate("project", "name");

    res.json(task);

  } catch (err) {
    console.error("KANBAN STATUS UPDATE ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
