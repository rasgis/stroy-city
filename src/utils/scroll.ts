import React from "react";

/**
 * Прокручивает страницу вверх с плавной анимацией
 * @param eventOrDuration Опциональное событие React или длительность анимации в мс
 */
export const scrollToTop = (
  eventOrDuration?: React.MouseEvent | number
): void => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
