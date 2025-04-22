import React from "react";
import styles from "./AnimationText.module.css";

interface AnimationTextProps {
  text?: string;
  fontSize?: number;
}

export const AnimationText: React.FC<AnimationTextProps> = ({
  text = "Добро пожаловать в Stroy City!",
  fontSize = 72,
}) => {
  return (
    <div className={styles.container}>
      <svg viewBox="0 0 1400 200" className={styles.svg}>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          className={styles.text}
          style={{
            fontSize: `${fontSize}px`,
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
