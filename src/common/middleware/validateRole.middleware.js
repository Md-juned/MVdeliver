export const checkAllowedRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.user_type)) {
        return res.send({ status: false, message: "Access denied" });
      }
      next();
    };
  };
  