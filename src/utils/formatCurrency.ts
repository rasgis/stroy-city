
export const formatCurrency = (
  value: number,
  currency: string = "₽",
  decimals: number = 2
): string => {
  return `${value.toFixed(decimals)} ${currency}`;
};
