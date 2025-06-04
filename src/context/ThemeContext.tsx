import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";


type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);

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

    setTimeout(() => {
      const categoryTitles = document.querySelectorAll(
        '[class*="categoryCard"] [class*="cardTitle"]'
      );
      
      categoryTitles.forEach((title) => {
        if (title instanceof HTMLElement) {
          title.style.visibility = "visible";
          title.style.opacity = "1";
          title.style.display = "flex";
          title.style.alignItems = "center";
          title.style.justifyContent = "center";
          
          if (theme === "light") {
            title.style.color = "#2c3e50";
            title.style.backgroundColor = "white";
          } else {
            title.style.color = "#d4ffea";
            title.style.backgroundColor = "#1d1e24";
          }
        }
      });
    }, 500);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";

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

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme должен использоваться внутри ThemeProvider");
  }
  return context;
};
