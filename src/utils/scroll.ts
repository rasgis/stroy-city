import React from "react";

export const scrollToTop = (
  eventOrDuration?: React.MouseEvent | number
): void => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
