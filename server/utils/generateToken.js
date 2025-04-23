import jwt from "jsonwebtoken";

/**
 * Генерирует JWT токен для пользователя
 *
 * @param {string} id - ID пользователя
 * @returns {string} JWT токен
 */
const generateToken = (id) => {
  // Создаем payload с информацией о пользователе
  const payload = {
    user: {
      id, // id пользователя
    },
  };

  console.log(`[Token Service] Генерация токена для пользователя: ${id}`);

  // Создаем и возвращаем JWT токен
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d", // Токен действителен 7 дней
  });
};

export default generateToken;
