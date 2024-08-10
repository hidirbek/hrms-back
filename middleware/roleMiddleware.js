const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  };
};

module.exports = roleMiddleware;
