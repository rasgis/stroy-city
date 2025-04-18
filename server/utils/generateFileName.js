import crypto from "crypto";

/**
 * Генерирует короткое случайное имя файла с сохранением расширения
 * @param {string} originalName - Оригинальное имя файла
 * @returns {string} - Случайное имя файла с расширением
 */
const generateFileName = (originalName) => {
  // Получаем расширение файла
  const extension = originalName.split(".").pop();

  // Генерируем короткую случайную строку из 6 символов
  const randomString = crypto.randomBytes(3).toString("hex");

  // Формируем новое имя файла: randomString.extension
  return `${randomString}.${extension}`;
};

export default generateFileName;
