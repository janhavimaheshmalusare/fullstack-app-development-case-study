const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const requireTaskTracker = require("../middleware/taskCreator.middleware");

const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

router.get("/users", auth, requireTaskTracker, async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role");
    res.status(200).json(users);
  } catch (err) {
    console.error("FETCH USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post("/projects", auth, requireTaskTracker, async (req, res) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      owner: req.body.owner || req.user.id
    });

    await project.populate({
      path: "owner",
      select: "email role"
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

router.get("/projects", auth, requireTaskTracker, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "email role");

    res.json(projects);
  } catch (err) {
    console.error("FETCH PROJECTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/projects/my", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const projects = await Project.find({ owner: userId })
      .populate("owner", "email role");

    res.json(projects);
  } catch (err) {
    console.error("FETCH MY PROJECTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch owned projects" });
  }
});

router.put("/projects/:id", auth, requireTaskTracker, async (req, res) => {
  try {
    const updateFields = {};

    if (req.body.name !== undefined)
      updateFields.name = req.body.name;

    if (req.body.description !== undefined)
      updateFields.description = req.body.description;

    if (req.body.startDate !== undefined)
      updateFields.startDate = req.body.startDate;

    if (req.body.endDate !== undefined)
      updateFields.endDate = req.body.endDate;

    if (req.body.owner !== undefined)
      updateFields.owner = req.body.owner;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.populate({
      path: "owner",
      select: "email role"
    });

    res.json(project);
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/projects/:id", auth, requireTaskTracker, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: req.params.id });

    res.json({ message: "Project and associated tasks deleted" });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/tasks", auth, requireTaskTracker, async (req, res) => {
  try {
    const task = await Task.create({
      description: req.body.description,
      dueDate: req.body.dueDate || null,
      status: req.body.status,
      project: req.body.project,
      owner: req.body.owner || req.user.id
    });

    await task.populate([
      { path: "owner", select: "email role" },
      { path: "project", select: "name" }
    ]);

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

router.put("/tasks/:id", auth, requireTaskTracker, async (req, res) => {
  try {
    const updateFields = {};

    if (req.body.description !== undefined)
      updateFields.description = req.body.description;

    if (req.body.dueDate !== undefined)
      updateFields.dueDate = req.body.dueDate || null;

    if (req.body.status !== undefined)
      updateFields.status = req.body.status;

    if (req.body.project !== undefined)
      updateFields.project = req.body.project;

    if (req.body.owner !== undefined)
      updateFields.owner = req.body.owner;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.populate([
      { path: "owner", select: "email role" },
      { path: "project", select: "name" }
    ]);

    res.json(task);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

router.get("/tasks/my", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const tasks = await Task.find({ owner: userId })
      .populate("owner", "email role")
      .populate("project", "name");

    res.json(tasks);
  } catch (err) {
    console.error("FETCH MY TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch assigned tasks" });
  }
});

router.delete("/tasks/:id", auth, requireTaskTracker, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/tasks", auth, requireTaskTracker, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("owner", "email role")
      .populate("project", "name");

    res.json(tasks);
  } catch (err) {
    console.error("FETCH ALL TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

module.exports = router;
