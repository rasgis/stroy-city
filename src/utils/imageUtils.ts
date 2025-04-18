/**
 * Утилиты для обработки и оптимизации изображений
 */

/**
 * Сжимает изображение до указанных максимальных размеров и уровня качества
 * @param file Исходный файл изображения
 * @param maxWidth Максимальная ширина результата (в пикселях)
 * @param maxHeight Максимальная высота результата (в пикселях)
 * @param quality Качество сжатия (от 0 до 1, где 1 - максимальное качество)
 * @returns Promise с новым Blob-объектом сжатого изображения
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Создаем временный объект FileReader для чтения файла
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Вычисляем новые размеры, сохраняя пропорции
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        // Создаем canvas для рисования сжатого изображения
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Не удалось получить 2D контекст для canvas"));
          return;
        }

        // Рисуем изображение на canvas с новыми размерами
        ctx.drawImage(img, 0, 0, width, height);

        // Определяем тип файла
        const mimeType = file.type || "image/jpeg";

        // Конвертируем canvas в Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Не удалось сжать изображение"));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Ошибка при загрузке изображения"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Ошибка при чтении файла изображения"));
    };
  });
};

/**
 * Преобразует Blob в File
 * @param blob Blob-объект для преобразования
 * @param fileName Имя файла
 * @returns File объект
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

/**
 * Сжимает изображение и возвращает его как File объект
 * @param file Исходный файл изображения
 * @param maxWidth Максимальная ширина результата (в пикселях)
 * @param maxHeight Максимальная высота результата (в пикселях)
 * @param quality Качество сжатия (от 0 до 1, где 1 - максимальное качество)
 * @returns Promise с новым File объектом сжатого изображения
 */
export const optimizeImage = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  try {
    // Проверяем, является ли файл изображением
    if (!file.type.startsWith("image/")) {
      throw new Error("Файл не является изображением");
    }

    // Если размер файла уже меньше 500KB, возвращаем его без изменений
    if (file.size < 500 * 1024) {
      console.log(
        "Изображение не требует оптимизации:",
        file.size / 1024,
        "KB"
      );
      return file;
    }

    // Адаптивное качество в зависимости от размера файла
    let adaptiveQuality = quality;
    if (file.size > 5 * 1024 * 1024) {
      // Больше 5MB
      adaptiveQuality = 0.6;
      console.log(
        "Большое изображение, применяем сильное сжатие (качество 0.6)"
      );
    } else if (file.size > 2 * 1024 * 1024) {
      // Больше 2MB
      adaptiveQuality = 0.7;
      console.log(
        "Среднее изображение, применяем среднее сжатие (качество 0.7)"
      );
    }

    const compressedBlob = await compressImage(
      file,
      maxWidth,
      maxHeight,
      adaptiveQuality
    );
    const optimizedFile = blobToFile(compressedBlob, file.name);

    console.log(
      `Изображение оптимизировано: ${(file.size / 1024).toFixed(2)}KB -> ${(
        optimizedFile.size / 1024
      ).toFixed(2)}KB`
    );

    return optimizedFile;
  } catch (error) {
    console.error("Ошибка при оптимизации изображения:", error);
    return file; // В случае ошибки возвращаем исходный файл
  }
};
