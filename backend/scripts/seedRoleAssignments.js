require("dotenv").config();
const mongoose = require("mongoose");
const RoleAssignment = require("../models/RoleAssignment");


const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await RoleAssignment.deleteMany();

    await RoleAssignment.insertMany([
      { email: "admin@test.com", role: "ADMIN" },
      { email: "tracker@test.com", role: "TASK_TRACKER" },
      { email: "readonly@test.com", role: "READ_ONLY" }
    ]);

    console.log("Role assignments seeded");
    process.exit();
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
};

seedRoles();
