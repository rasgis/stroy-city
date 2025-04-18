import { CLOUDINARY_CONFIG } from '../config/cloudinary';

export const cloudinaryService = {
  async uploadImage(file: File): Promise<string> {
    try {
      if (!CLOUDINARY_CONFIG.CLOUD_NAME || !CLOUDINARY_CONFIG.UPLOAD_PRESET) {
        throw new Error('Отсутствуют настройки Cloudinary');
      }

      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);

      // Отправляем запрос на загрузку в Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при загрузке изображения');
      }

      const data = await response.json();
      
      // Возвращаем URL загруженного изображения
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Не удалось загрузить изображение');
    }
  },

  // Функция для оптимизации URL изображения
  getOptimizedImageUrl(url: string, options: { width?: number; height?: number; quality?: number } = {}) {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    // Разбиваем URL на части
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
      return url;
    }

    // Формируем параметры трансформации
    const transformations = [];

    if (options.width || options.height) {
      transformations.push('c_fill'); // crop mode
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
    }

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    // Если нет трансформаций, возвращаем оригинальный URL
    if (transformations.length === 0) {
      return url;
    }

    // Собираем новый URL с трансформациями
    return `${urlParts[0]}/upload/${transformations.join(',')}/` + urlParts[1];
  }
}; 