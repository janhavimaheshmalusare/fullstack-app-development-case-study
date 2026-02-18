require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

const adminRoutes = require("./routes/admin.routes");

const taskCreatorRoutes = require("./routes/taskCreator.routes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/task-creator", taskCreatorRoutes);
app.use("/api/kanban", require("./routes/kanban.routes"));

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

