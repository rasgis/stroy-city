import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { logoutUser, updateUserData } from "../../reducers/authSlice";
import { ROUTES } from "../../constants/routes";
import { User, UserUpdateData } from "../../types/user";
import { Loader, Modal } from "../../components";
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useAppSelector((state) => state.auth);
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Сначала проверяем наличие сохраненного профиля
        const savedProfile = authService.loadSavedProfile();
        
        // Если у нас есть сохраненный профиль, используем его
        if (savedProfile) {
          console.log("Использую сохраненный профиль:", savedProfile);
          setUser(savedProfile);
          setName(savedProfile.name || "");
          setEmail(savedProfile.email || "");
          setLogin(savedProfile.login || "");
          setIsLoading(false);
          return;
        }
        
        // Если у нас уже есть данные пользователя в Redux, используем их
        if (authUser) {
          // Преобразуем тип из auth.User в user.User
          const userData: User = {
            _id: authUser._id || authUser.id || "",
            name: authUser.name || "",
            email: authUser.email || "",
            login: authUser.login || "",
            role: authUser.role as "user" | "admin",
          };
          
          setUser(userData);
          setName(userData.name || "");
          setEmail(userData.email || "");
          setLogin(userData.login || "");
          setIsLoading(false);
          return;
        }
        
        // Иначе получаем данные с сервера
        const userData = await authService.getUserProfile();
        
        // Преобразуем тип из auth.User в user.User
        const userObj: User = {
          _id: userData._id || "",
          name: userData.name || "",
          email: userData.email || "",
          login: userData.login || "",
          role: userData.role as "user" | "admin",
        };
        
        setUser(userObj);
        
        // Устанавливаем значения формы
        setName(userData.name || "");
        setEmail(userData.email || "");
        setLogin(userData.login || "");
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Произошла ошибка при загрузке профиля");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Для отладки - выведем данные пользователя и токен
      console.log("Текущий пользователь:", authUser);
      console.log("Токен:", authService.getToken() ? "присутствует" : "отсутствует");
      
      const userData: UserUpdateData = {
        name,
        email,
        login,
      };
      
      // Добавляем пароль только если он был введен
      if (password) {
        userData.password = password;
      }
      
      /* ВРЕМЕННОЕ РЕШЕНИЕ: Используем localUpdateUserProfile вместо прямого вызова API */
      console.log("Применяем улучшенное временное решение для обновления профиля");
      
      try {
        // Используем метод localUpdateUserProfile для обновления профиля
        const updatedUser = authService.localUpdateUserProfile(userData);
        
        // Обновляем данные в Redux
        dispatch(updateUserData(updatedUser));
        
        // Показываем сообщение об успехе
        setSuccessMessage("Профиль успешно обновлен и сохранен локально");
        
        // Обновляем локальное состояние
        setUser(updatedUser);
        
        // Сбрасываем поля пароля
        setPassword("");
        setConfirmPassword("");
      } catch (updateError) {
        console.error("Ошибка при локальном обновлении:", updateError);
        throw updateError;
      }
      /* КОНЕЦ ВРЕМЕННОГО РЕШЕНИЯ */
      
      /* ЗАКОММЕНТИРОВАННЫЙ ОРИГИНАЛЬНЫЙ КОД
      // Обновляем профиль через API
      const updatedUser = await userService.updateUserProfile(userData);
      
      // Обновляем локальное состояние
      const userObj: User = {
        _id: updatedUser._id || "",
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        login: updatedUser.login || "",
        role: updatedUser.role as "user" | "admin",
      };
      
      setUser(userObj);
      
      // Обновляем данные в Redux и localStorage
      dispatch(updateUserData(updatedUser));
      authService.updateUserData(updatedUser);
      
      // Показываем сообщение об успехе
      setSuccessMessage("Профиль успешно обновлен");
      
      // Сбрасываем поля пароля
      setPassword("");
      setConfirmPassword("");
      */
      
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при обновлении профиля");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (user && user._id) {
        // Используем метод удаления пользователя
        await userService.deleteUser(user._id);
        
        // Выходим из системы
        dispatch(logoutUser());
        
        // Перенаправляем на главную страницу
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      console.error("Ошибка при удалении аккаунта:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при удалении аккаунта");
      }
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Container className={styles.container}>
        <Loader message="Загрузка данных профиля..." />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <div className={styles.profileCard}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Профиль пользователя
        </Typography>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className={styles.success}>
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Имя
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>
              Логин
            </label>
            <input
              id="login"
              type="text"
              className={styles.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Новый пароль (оставьте пустым, чтобы не менять)
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Подтвердите новый пароль
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!password}
            />
          </div>
          
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </button>
            
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Удалить аккаунт
            </button>
          </div>
        </form>
      </div>
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удаление аккаунта"
        type="delete"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Удалить"
      >
        <p>Вы действительно хотите удалить свой аккаунт?</p>
        <p>Это действие нельзя будет отменить, и все ваши данные будут удалены.</p>
      </Modal>
    </Container>
  );
};

export default Profile; 