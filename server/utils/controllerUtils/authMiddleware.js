import pkg from "express";
const { Response, NextFunction } = pkg;

export const checkAuth = (req, res, next, options = {}) => {
  const { requireAdmin = false } = options;

  if (!req.user) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  if (requireAdmin && req.user.role !== "admin") { 
    res
      .status(403)
      .json({ message: "Доступ запрещен. Требуются права администратора." });
    return;
  }

  next();
};

export const createAuthMiddleware = (options = {}) => { 
  return (req, res, next) => checkAuth(req, res, next, options); 
};

export const requireAdmin = createAuthMiddleware({ requireAdmin: true }); 
