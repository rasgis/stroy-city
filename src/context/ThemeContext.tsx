import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Типы темы
export type ThemeType = "dark" | "light";

// Тип для контекста темы
interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

// Создаем контекст с начальным значением
const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

// Хук для использования контекста темы
export const useTheme = () => useContext(ThemeContext);

// Провайдер контекста темы
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Получаем сохраненную тему из localStorage или используем тёмную тему по умолчанию
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    return savedTheme === "light" ? "light" : "dark";
  });

  // Функция для переключения темы
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // При изменении темы сохраняем её в localStorage и применяем класс к body
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
