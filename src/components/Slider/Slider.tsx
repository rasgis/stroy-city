import React, { useState, useEffect } from "react";
import styles from "./Slider.module.css";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface SliderProps {
  slides: {
    image: string;
    title: string;
    description: string;
  }[];
  autoPlayInterval?: number;
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval]);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${styles.slide} ${
              index === currentSlide ? styles.active : ""
            }`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={styles.slideImage}
            />
            <div className={styles.slideContent}>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={goToPrevSlide}
      >
        <ArrowBack />
      </button>
      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={goToNextSlide}
      >
        <ArrowForward />
      </button>

      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === currentSlide ? styles.activeDot : ""
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};
