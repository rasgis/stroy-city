import React, { useState, useEffect } from "react";
import { FaLink } from "react-icons/fa";
import { BsX } from "react-icons/bs";
import { handleImageError, isValidImageUrl } from "../../utils/imageUtils";
import styles from "./SimpleImageSelector.module.css";

export interface SimpleImageSelectorProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

/**
 * Упрощенный компонент для выбора изображения по URL
 */
export const SimpleImageSelector: React.FC<SimpleImageSelectorProps> = ({
  value = "",
  onChange,
  label = "Изображение",
  error = false,
  helperText = "",
}) => {
  const [imageUrl, setImageUrl] = useState<string>(value || "");
  const [preview, setPreview] = useState<string>(value || "");
  const [localError, setLocalError] = useState<string>("");

  useEffect(() => {
    if (value) {
      setImageUrl(value);
      setPreview(value);
    }
  }, [value]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);

    if (url.trim() === "") {
      setPreview("");
      onChange("");
      setLocalError("");
      return;
    }

    if (isValidImageUrl(url)) {
      setPreview(url);
      onChange(url);
      setLocalError("");
    } else {
      setLocalError("Пожалуйста, введите корректный URL изображения");
    }
  };

  const clearInput = () => {
    setImageUrl("");
    setPreview("");
    onChange("");
    setLocalError("");
  };

  // Обработчик ошибки загрузки изображения
  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageError(e, "/placeholder-image.png");
    setLocalError("Не удалось загрузить изображение. Проверьте URL.");
  };

  return (
    <div className={styles.simpleImageSelector}>
      <label className={styles.label}>{label}</label>

      <div className={styles.inputContainer}>
        <div className={styles.formField}>
          <input
            type="text"
            className={`${styles.input} ${
              localError || error ? styles.inputError : ""
            }`}
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
          <div className={styles.inputIcon}>
            <FaLink />
          </div>

          {imageUrl && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearInput}
              title="Очистить"
            >
              <BsX />
            </button>
          )}
        </div>

        {(localError || helperText) && (
          <div
            className={
              error || localError ? styles.errorText : styles.helperText
            }
          >
            {localError || helperText}
          </div>
        )}
      </div>

      {preview && (
        <div className={styles.previewContainer}>
          <img
            src={preview}
            alt="Предпросмотр"
            className={styles.previewImage}
            onError={handleImageLoadError}
          />
        </div>
      )}
    </div>
  );
};
