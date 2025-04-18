import React, { useState, useCallback, useEffect } from 'react';
import { optimizeImage } from '../../utils/imageUtils';
import styles from './ImageSelector.module.css';
import { FaLink, FaCloudUploadAlt, FaImages } from 'react-icons/fa';
import { imageService } from '../../services/imageService';
import { BsImage, BsCloudUpload, BsServer, BsExclamationCircle, BsX } from 'react-icons/bs';

// Типы входных параметров компонента
export interface ImageSelectorProps {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  iconOnly?: boolean;
}

// Перечисление для типов добавления изображения
enum ImageSourceType {
  URL = 'url',
  UPLOAD = 'upload',
  SERVER = 'server'
}

/**
 * Компонент для выбора изображений с несколькими способами добавления:
 * 1. Ссылка на внешнее изображение
 * 2. Загрузка нового изображения
 * 3. Выбор из уже загруженных изображений на сервере
 */
export const ImageSelector: React.FC<ImageSelectorProps> = ({
  value = '',
  onChange,
  onFileChange,
  label = 'Изображение',
  error = false,
  helperText = '',
  iconOnly = false,
}) => {
  // Состояние для отслеживания выбранного источника изображения
  const [sourceType, setSourceType] = useState<ImageSourceType>(ImageSourceType.URL);
  
  // Состояние для хранения URL изображения
  const [imageUrl, setImageUrl] = useState<string>(value || '');
  
  // Состояние для хранения выбранного файла
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Состояние для предпросмотра изображения
  const [preview, setPreview] = useState<string>(value || '');

  // Состояние для хранения ошибки
  const [localError, setLocalError] = useState<string>('');

  // Состояние для серверных изображений
  const [serverImages, setServerImages] = useState<string[]>([]);
  const [selectedServerImage, setSelectedServerImage] = useState<string>('');

  // При изменении значения, обновляем состояние
  useEffect(() => {
    if (value) {
      setImageUrl(value);
      setPreview(value);
    }
  }, [value]);

  // Загружаем доступные изображения с сервера (имитация)
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    const mockServerImages = [
      'https://via.placeholder.com/150/92c952',
      'https://via.placeholder.com/150/771796',
      'https://via.placeholder.com/150/24f355',
      'https://via.placeholder.com/150/f66b97',
    ];
    setServerImages(mockServerImages);
  }, []);

  // Обработчик изменения источника изображения
  const handleSourceChange = (type: ImageSourceType) => {
    setSourceType(type);
    // Сбрасываем ошибки при смене вкладки
    setLocalError('');
  };

  // Обработчик изменения URL изображения
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url.trim() === '') {
      setPreview('');
      onChange('');
      setLocalError('');
      return;
    }

    if (imageService.isValidImageUrl(url)) {
      setPreview(url);
      onChange(url);
      setLocalError('');
    } else {
      setLocalError('Пожалуйста, введите корректный URL изображения');
    }
  };

  // Обработчик выбора файла изображения
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Пожалуйста, выберите файл изображения');
      return;
    }

    setSelectedFile(file);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const result = fileReader.result as string;
      setPreview(result);
      onChange(result);
      setLocalError('');
      if (onFileChange) onFileChange(file);
    };
    fileReader.readAsDataURL(file);
  };

  // Обработчик выбора изображения с сервера
  const handleServerImageSelect = (url: string) => {
    setSelectedServerImage(url);
    setPreview(url);
    onChange(url);
  };

  // Проверяет, является ли строка корректным URL изображения
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Простая проверка на наличие расширения изображения
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Проверка на корректный URL
    try {
      new URL(url);
      return hasImageExtension || url.startsWith('data:image/');
    } catch (e) {
      return false;
    }
  };

  // Рендер компонента для ввода URL
  const renderUrlInput = () => (
    <div className={styles.inputContainer}>
      <div className={styles.formField}>
        <input
          type="text"
          className={`${styles.input} ${localError ? styles.inputError : ''}`}
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
        />
        <div className={styles.inputIcon}>
          <FaLink />
        </div>
      </div>
      {localError && (
        <div className={styles.errorText}>{localError}</div>
      )}
    </div>
  );

  // Рендер компонента для загрузки файла
  const renderFileUpload = () => (
    <div className={styles.fileUploadContainer}>
      <label className={styles.uploadButton}>
        <span className={styles.uploadIcon}><FaCloudUploadAlt /></span>
        <span>Выбрать файл</span>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </label>
      
      {selectedFile && (
        <div className={styles.fileName}>
          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </div>
      )}
      
      {localError && (
        <div className={styles.errorText}>{localError}</div>
      )}
    </div>
  );

  // Рендер компонента для выбора изображения с сервера
  const renderServerImages = () => (
    <div className={styles.serverImagesContainer}>
      {serverImages.length > 0 ? (
        <div className={styles.imageGrid}>
          {serverImages.map((imageUrl, index) => (
            <div
              key={index}
              className={`${styles.serverImageItem} ${selectedServerImage === imageUrl ? styles.selected : ''}`}
              onClick={() => handleServerImageSelect(imageUrl)}
            >
              <img src={imageUrl} alt={`Серверное изображение ${index + 1}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noImagesText}>
          Нет доступных изображений на сервере
        </div>
      )}
    </div>
  );

  // Если iconOnly, отображаем упрощенный интерфейс
  if (iconOnly) {
    return (
      <div className={styles.iconOnlyContainer}>
        <input
          type="file"
          id="image-upload"
          className={styles.fileInput}
          onChange={handleFileChange}
          accept="image/*"
        />
        <label htmlFor="image-upload" className={styles.iconOnlyButton}>
          <BsImage size={24} />
        </label>
        {preview && (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Предпросмотр" className={styles.previewImage} />
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setImageUrl('');
                setSelectedFile(null);
                setPreview('');
                onChange('');
                setLocalError('');
              }}
              aria-label="Очистить"
            >
              <BsX size={20} />
            </button>
          </div>
        )}
        {(error || localError) && (
          <div className={styles.errorText}>
            <BsExclamationCircle /> {helperText || localError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${error || localError ? styles.error : ''}`}>
      <div className={styles.label}>
        {label}
      </div>
      
      <div className={styles.tabs}>
        <button 
          type="button"
          className={`${styles.tab} ${sourceType === ImageSourceType.URL ? styles.activeTab : ''}`}
          onClick={() => handleSourceChange(ImageSourceType.URL)}
        >
          <BsImage /> URL
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${sourceType === ImageSourceType.UPLOAD ? styles.activeTab : ''}`}
          onClick={() => handleSourceChange(ImageSourceType.UPLOAD)}
        >
          <BsCloudUpload /> Загрузить
        </button>
        <button 
          type="button"
          className={`${styles.tab} ${sourceType === ImageSourceType.SERVER ? styles.activeTab : ''}`}
          onClick={() => handleSourceChange(ImageSourceType.SERVER)}
        >
          <BsServer /> Сервер
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {sourceType === ImageSourceType.URL && renderUrlInput()}
        {sourceType === ImageSourceType.UPLOAD && renderFileUpload()}
        {sourceType === ImageSourceType.SERVER && renderServerImages()}
      </div>
      
      {preview && (
        <div className={styles.previewContainer}>
          <div className={styles.previewLabel}>
            Предпросмотр
          </div>
          <div className={styles.imagePreview}>
            <img src={preview} alt="Предпросмотр" />
          </div>
        </div>
      )}
      
      {error && !localError && (
        <div className={styles.errorText}>
          {helperText}
        </div>
      )}
    </div>
  );
}; 