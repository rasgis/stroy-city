/**
 * Функция для форматирования числа в денежный формат
 * @param value Число для форматирования
 * @param currency Символ валюты (по умолчанию "₽")
 * @param decimals Количество знаков после запятой (по умолчанию 2)
 * @returns Отформатированная строка с денежным значением
 */
export const formatCurrency = (
  value: number,
  currency: string = "₽",
  decimals: number = 2
): string => {
  return `${value.toFixed(decimals)} ${currency}`;
};
