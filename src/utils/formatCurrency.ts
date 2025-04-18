/**
 * Функция для форматирования числа в денежный формат
 * @param value Число для форматирования
 * @returns Отформатированная строка с денежным значением
 */
export const formatCurrency = (value: number): string => {
  return `${value.toFixed(2)} ₽`;
}; 