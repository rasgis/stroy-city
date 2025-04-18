export const CATEGORIES = [
  "Цемент и бетон",
  "Кирпич и блоки",
  "Пиломатериалы",
  "Кровля",
  "Изоляция",
  "Краски и лаки",
  "Инструменты",
  "Крепеж",
  "Сантехника",
  "Электрика",
] as const;

export type Category = (typeof CATEGORIES)[number];
