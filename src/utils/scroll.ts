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

/**
 * Прокручивает страницу до указанного элемента с плавной анимацией
 * @param elementId ID элемента, к которому нужно прокрутить страницу
 * @param offset Дополнительный отступ сверху (по умолчанию 0)
 */
export const scrollToElement = (
  elementId: string,
  offset: number = 0
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = rect.top + scrollTop - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
};

/**
 * Проверяет, виден ли элемент в текущей области просмотра
 * @param element HTML элемент для проверки
 * @param partialVisibility Учитывать частичную видимость (по умолчанию true)
 * @returns boolean - видимость элемента
 */
export const isElementInViewport = (
  element: HTMLElement,
  partialVisibility: boolean = true
): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // Проверка полной видимости
  const vertInView = partialVisibility
    ? rect.top <= windowHeight && rect.bottom >= 0
    : rect.top >= 0 && rect.bottom <= windowHeight;

  const horInView = partialVisibility
    ? rect.left <= windowWidth && rect.right >= 0
    : rect.left >= 0 && rect.right <= windowWidth;

  return vertInView && horInView;
};
