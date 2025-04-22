import jwt from "jsonwebtoken";

const generateToken = (id) => {
  // Создаем payload с информацией о пользователе
  const payload = {
    user: {
      id // id пользователя
    }
  };
  
  console.log("Генерация токена для пользователя:", id);
  console.log("Payload токена:", payload);

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
