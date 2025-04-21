/**
 * Подготавливает данные для отправки на сервер
 * @param data Исходные данные объекта
 * @returns Подготовленные данные для отправки
 */
export function prepareDataForApi(data: Record<string, any>): Record<string, any> {
  // Просто возвращаем копию данных, так как теперь работаем только с URL
  return { ...data };
} 