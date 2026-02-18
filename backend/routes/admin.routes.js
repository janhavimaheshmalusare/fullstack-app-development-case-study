const express = require("express");
const router = express.Router();

const User = require("../models/User");
const RoleAssignment = require("../models/RoleAssignment");
const authMiddleware = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/role.middleware");

router.get(
  "/roles",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const roles = await RoleAssignment.find({});
      res.status(200).json(roles);
    } catch (err) {
      console.error("FETCH ROLES ERROR:", err);
      res.status(500).json({ message: "Failed to fetch role assignments" });
    }
  }
);

router.post(
  "/roles",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ message: "Email and role required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await RoleAssignment.findOne({
        email: normalizedEmail
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "Authorization already exists" });
      }

      const newRole = await RoleAssignment.create({
        email: normalizedEmail,
        role
      });

      res.status(201).json(newRole);
    } catch (err) {
      console.error("CREATE ROLE ERROR:", err);
      res.status(500).json({ message: "Create failed" });
    }
  }
);

router.put(
  "/roles/:email",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const originalEmail = req.params.email.toLowerCase().trim();
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ message: "Email and role required" });
      }

      const newEmail = email.toLowerCase().trim();

      const updatedRole = await RoleAssignment.findOneAndUpdate(
        { email: originalEmail },
        { email: newEmail, role },
        { new: true }
      );

      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      await User.findOneAndUpdate(
        { email: originalEmail },
        { email: newEmail, role }
      );

      res.status(200).json(updatedRole);
    } catch (err) {
      console.error("UPDATE ROLE ERROR:", err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

router.delete(
  "/roles/:email",
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      const email = req.params.email.toLowerCase().trim();

      await RoleAssignment.findOneAndDelete({ email });
      await User.findOneAndDelete({ email });

      res.status(200).json({ message: "Role and user deleted" });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ message: "Delete failed" });
    }
  }
);

module.exports = router;
