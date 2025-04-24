/**
 * Модуль контекста темы приложения
 *
 * Предоставляет функциональность для управления темой оформления (светлая/темная)
 * и сохранения выбора пользователя в localStorage.
 */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

/**
 * Тип темы - "light" или "dark"
 */
type ThemeType = "light" | "dark";

/**
 * Интерфейс контекста темы
 */
interface ThemeContextType {
  /** Текущая тема */
  theme: ThemeType;
  /** Функция для переключения между темами */
  toggleTheme: () => void;
}

/**
 * Контекст темы для использования в компонентах
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Свойства провайдера темы
 */
interface ThemeProviderProps {
  /** Дочерние элементы */
  children: ReactNode;
}

/**
 * Провайдер для управления темой приложения
 *
 * Устанавливает тему на основе предпочтения пользователя, сохраненного в localStorage,
 * или использует системные настройки при первом посещении.
 *
 * @param {ThemeProviderProps} props - Свойства провайдера
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Получаем сохраненную тему из localStorage или используем системные настройки
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    if (savedTheme) {
      return savedTheme;
    } else {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  });

  useEffect(() => {
    // Применяем тему к документу и сохраняем в localStorage
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Принудительное применение темы: добавляем класс на верхний уровень
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);

    // Обновляем мета-тег
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#1a1a1f" : "#f5f2eb"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = theme === "dark" ? "#1a1a1f" : "#f5f2eb";
      document.head.appendChild(meta);
    }
  }, [theme]);

  /**
   * Переключает тему между светлой и темной
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";

      // Принудительно устанавливаем атрибут для ускорения отклика
      document.documentElement.setAttribute("data-theme", newTheme);
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add(`theme-${newTheme}`);

      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Хук для использования контекста темы в компонентах
 *
 * @returns {ThemeContextType} Объект с текущей темой и функцией для её переключения
 * @throws {Error} Если хук используется вне ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme должен использоваться внутри ThemeProvider");
  }
  return context;
};
