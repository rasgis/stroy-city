import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Нет токена, авторизация отклонена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Токен недействителен" });
  }
};
