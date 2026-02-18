module.exports = function (req, res, next) {
  if (
    req.user.role !== "TASK_TRACKER" &&
    req.user.role !== "ADMIN"
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
