import React, { useEffect, useState } from "react";
import {
  WbSunny,
  Cloud,
  WaterDrop,
  Air,
  Thunderstorm,
  Edit,
  Search,
  CalendarMonth,
  Refresh,
} from "@mui/icons-material";
import styles from "./WeatherWidget.module.css";

const STORAGE_KEY = "weather_city_key";
const DEFAULT_CITY = "Владикавказ";

export const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temperature: 0,
    condition: "sunny",
    humidity: 0,
    windSpeed: 0,
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [forecast, setForecast] = useState([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("солн"))
      return <WbSunny className={styles.weatherIcon} />;
    if (conditionLower.includes("облачн"))
      return <Cloud className={styles.weatherIcon} />;
    if (conditionLower.includes("дожд"))
      return <WaterDrop className={styles.weatherIcon} />;
    if (conditionLower.includes("снег"))
      return <Cloud className={styles.weatherIcon} />;
    if (conditionLower.includes("гроз"))
      return <Thunderstorm className={styles.weatherIcon} />;
    return <WbSunny className={styles.weatherIcon} />;
  };

  const fetchWeather = (city: string) => {
    setLoading(true);
    setError("");

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ru&appid=df89244c7d25e01ef07fc0f9f1715a8d`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Город не найден");
        return response.json();
      })
      .then(({ name, main, weather, wind }) => {
        const weatherData = {
          temperature: Math.round(main.temp),
          condition: weather[0].description,
          humidity: main.humidity,
          windSpeed: Math.round(wind.speed),
          city: name,
        };

        setWeather(weatherData);

        // Сохраняем выбранный город в localStorage
        localStorage.setItem(STORAGE_KEY, name);

        setIsModalOpen(false);
        setNewCity("");
        setEditingCity(false);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => setLoading(false));
  };

  const fetchForecast = (city: string) => {
    setLoading(true);

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ru&appid=df89244c7d25e01ef07fc0f9f1715a8d`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Город не найден");
        return response.json();
      })
      .then((data) => {
        // Группируем прогноз по дням (берем данные на 12:00 каждого дня)
        const dailyData = data.list
          .filter((item: any) => item.dt_txt.includes("12:00:00"))
          .slice(0, 7); // Берем до 7 дней

        // Форматируем данные
        const forecastData = dailyData.map((day: any) => ({
          date: new Date(day.dt * 1000),
          temperature: Math.round(day.main.temp),
          condition: day.weather[0].description,
          humidity: day.main.humidity,
          windSpeed: Math.round(day.wind.speed),
          icon: day.weather[0].icon,
        }));

        setForecast(forecastData);
        setShowForecast(true);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Очищаем старые ключи, которые могли остаться в localStorage
    localStorage.removeItem("weather_city");

    // Добавляем логирование для отладки
    const savedCity = localStorage.getItem(STORAGE_KEY);

    // Если нет сохраненного города, устанавливаем Владикавказ и сохраняем его
    if (!savedCity) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_CITY);
    }

    // Используем сохраненный город или Владикавказ
    fetchWeather(savedCity || DEFAULT_CITY);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity.trim()) {
      fetchWeather(newCity.trim());
    }
  };

  const handleOpenModal = () => {
    setNewCity(weather.city);
    setIsModalOpen(true);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  const handleToggleWidget = () => {
    setIsVisible(!isVisible);
  };

  const handleEditCity = () => {
    setEditingCity(true);
    setNewCity(weather.city);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  const handleForecastClick = () => {
    fetchForecast(weather.city);
  };

  const handleCloseForecast = () => {
    setShowForecast(false);
  };

  // Добавляем кнопку обновления погоды для текущего города
  const refreshWeather = () => {
    const currentCity = localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY;
    fetchWeather(currentCity);
  };

  if (loading) return null;

  return (
    <div className={styles.weatherWidgetContainer}>
      {isVisible && (
        <div className={`${styles.weatherWidget} ${styles.visible}`}>
          <button
            className={styles.refreshButton}
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем всплытие события
              refreshWeather();
            }}
            title="Обновить данные"
          >
            <Refresh style={{ width: "18px", height: "18px" }} />
          </button>
          <div className={styles.location}>
            {editingCity ? (
              <form onSubmit={handleSubmit} className={styles.cityEditForm}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Введите город"
                  className={styles.cityInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <Search fontSize="small" />
                </button>
              </form>
            ) : (
              <div className={styles.cityDisplay}>
                <button
                  className={styles.forecastButton}
                  onClick={handleForecastClick}
                  title="Прогноз на неделю"
                >
                  <CalendarMonth fontSize="small" />
                </button>
                <button
                  className={styles.editCityButton}
                  onClick={handleEditCity}
                  title="Изменить город"
                >
                  <Edit fontSize="small" />
                </button>
                <h2>{weather.city}</h2>
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
          </div>
          <div className={styles.weatherInfo}>
            <div className={styles.mainInfo}>
              {getWeatherIcon(weather.condition)}
              <div className={styles.temperature}>{weather.temperature}°C</div>
            </div>
            <div className={styles.condition}>{weather.condition}</div>
            <div className={styles.details}>
              <div className={styles.detail}>
                <span>Влажность: {weather.humidity}%</span>
              </div>
              <div className={styles.detail}>
                <span>Ветер: {weather.windSpeed} м/с</span>
              </div>
            </div>
          </div>

          {showForecast && forecast.length > 0 && (
            <div className={styles.forecastContainer}>
              <div className={styles.forecastHeader}>
                <h3>Прогноз на неделю</h3>
                <button
                  className={styles.closeButton}
                  onClick={handleCloseForecast}
                >
                  ×
                </button>
              </div>
              <div className={styles.forecastList}>
                {forecast.map((day: any, index) => (
                  <div key={index} className={styles.forecastDay}>
                    <div className={styles.forecastDate}>
                      {day.date.toLocaleDateString("ru-RU", {
                        weekday: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className={styles.forecastTemp}>
                      {day.temperature}°C
                    </div>
                    <div className={styles.forecastCondition}>
                      {day.condition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button className={styles.toggleButton} onClick={handleToggleWidget}>
        {getWeatherIcon(weather.condition)}
      </button>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Введите название города</h3>
            <p className={styles.currentCity}>
              Текущий город: <strong>{weather.city}</strong>
            </p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Например: Москва"
                className={styles.input}
              />
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Найти
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewCity("");
                    setError("");
                    // Если была ошибка, проверяем сохраненный город
                    if (error) {
                      const savedCity = localStorage.getItem(STORAGE_KEY);
                      if (savedCity) {
                        // Если поиск был с ошибкой, возвращаемся к прежнему городу
                        fetchWeather(savedCity);
                      }
                    }
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
