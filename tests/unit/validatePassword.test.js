/**
 * Юнит-тест для функции валидации пароля
 *
 * Этот тест проверяет функционал безопасной валидации пароля
 * в соответствии с требованиями приложения.
 */

import bcrypt from "bcryptjs";

// Функция для тестирования
async function validatePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Ошибка при валидации пароля:", error);
    return false;
  }
}

// Мок для bcrypt.compare
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

describe("validatePassword", () => {
  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    bcrypt.compare.mockReset();
  });

  it("должна возвращать true для правильного пароля", async () => {
    // Настраиваем мок
    bcrypt.compare.mockResolvedValue(true);

    // Вызываем функцию
    const result = await validatePassword("password123", "hashedPassword");

    // Проверяем результат
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
  });

  it("должна возвращать false для неправильного пароля", async () => {
    // Настраиваем мок
    bcrypt.compare.mockResolvedValue(false);

    // Вызываем функцию
    const result = await validatePassword("wrongPassword", "hashedPassword");

    // Проверяем результат
    expect(result).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongPassword",
      "hashedPassword"
    );
  });

  it("должна возвращать false при ошибке bcrypt", async () => {
    // Настраиваем мок чтобы выбросить ошибку
    bcrypt.compare.mockRejectedValue(new Error("Ошибка хеширования"));

    // Вызываем функцию
    const result = await validatePassword("password123", "hashedPassword");

    // Проверяем результат
    expect(result).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
  });
});
