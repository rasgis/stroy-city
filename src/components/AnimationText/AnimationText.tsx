import React from "react";
import styles from "./AnimationText.module.css";

interface AnimationTextProps {
  text?: string;
  fontSize?: number;
  textColor?: string;
}

export const AnimationText: React.FC<AnimationTextProps> = ({
  text = "Добро пожаловать в Stroy City!",
  fontSize = 72,
  textColor = "currentColor",
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
            fill: textColor,
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
