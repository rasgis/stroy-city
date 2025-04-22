import axios from "axios";
import { API_CONFIG } from "../config/api";
import { authService } from "./authService";

// Тип для данных изображения
export interface ImageInfo {
  id: string;
  url: string;
  name: string;
  type: "product" | "category" | "other";
  createdAt: string;
  size: number;
}

// Тип изображения для использования в интерфейсе
export type ImageType = "product" | "category" | "other";

class ImageService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      ...API_CONFIG.HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Получает список всех изображений с сервера
   * @param type Опционально, тип изображений для фильтрации
   * @returns Массив информации об изображениях
   */
  async getImages(type?: ImageType): Promise<ImageInfo[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/images${
        type ? `?type=${type}` : ""
      }`;
      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении списка изображений:", error);
      return [];
    }
  }

  /**
   * Удаляет изображение с сервера
   * @param imageId ID изображения для удаления
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/images/${imageId}`;
      await axios.delete(url, { headers: this.getHeaders() });
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      throw new Error("Не удалось удалить изображение");
    }
  }

  /**
   * Проверяет, является ли строка корректным URL изображения
   * @param url URL для проверки
   * @returns Булево значение, указывающее на валидность URL изображения
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Проверка на наличие расширения изображения
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const hasImageExtension = imageExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );

    // Проверка на корректный URL
    try {
      new URL(url);
      return hasImageExtension || url.startsWith("data:image/");
    } catch (e) {
      return false;
    }
  }

  /**
   * Преобразует base64 строку в File
   * @param base64 Base64 строка
   * @param filename Имя файла
   * @returns File объект
   */
  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}

export const imageService = new ImageService();
