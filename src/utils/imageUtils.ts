/**
 * Утилиты для обработки изображений
 */

/**
 * Обрабатывает ошибку загрузки изображения, подставляя placeholder
 * @param event Событие ошибки
 * @param placeholder URL placeholder-изображения (по умолчанию "/placeholder-image.png")
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  placeholder: string = "/placeholder-image.png"
): void => {
  const target = event.target as HTMLImageElement;
  target.src = placeholder;
};

/**
 * Проверяет, является ли строка корректным URL изображения
 * @param url Строка с URL для проверки
 * @returns true, если URL является корректной ссылкой на изображение
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Проверка на наличие расширения изображения
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const hasImageExtension = imageExtensions.some((ext) =>
    url.toLowerCase().includes(ext)
  );

  // Проверка на корректный URL
  try {
    new URL(url);
    return (
      hasImageExtension ||
      url.startsWith("data:image/") ||
      url.startsWith("http")
    );
  } catch (e) {
    return false; // Если URL некорректный, возвращаем false
  }
};
