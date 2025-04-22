import { cloudinaryService } from './cloudinaryService';
import { optimizeImage } from "../utils/imageUtils";

export const fileService = {
  async saveImage(file: File, type?: "product" | "category"): Promise<string> {
    try {
      // Оптимизируем изображение перед загрузкой
      const optimizedFile = await optimizeImage(file, 1200, 1200, 0.7);


      // Загружаем изображение в Cloudinary
      const imageUrl = await cloudinaryService.uploadImage(optimizedFile);

      // Возвращаем оптимизированный URL изображения
      return cloudinaryService.getOptimizedImageUrl(imageUrl, {
        width: 800,
        height: 800,
        quality: 90
      });
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Не удалось сохранить изображение');
    }
  },
};
