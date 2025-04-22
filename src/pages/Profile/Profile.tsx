import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { logoutUser, updateUserData } from "../../reducers/authSlice";
import { ROUTES } from "../../constants/routes";
import { User as AuthUser } from "../../types/auth";
import { User, UserUpdateData } from "../../types/user";
import { Loader, Modal } from "../../components";
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const profileFetchedRef = useRef(false);

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
        // Если профиль уже загружался, не делаем повторный запрос
        if (profileFetchedRef.current) {
          return;
        }

        setIsLoading(true);
        setError(null);

        // Проверяем, что текущий пользователь существует
        if (!authUser) {
          console.error("Нет данных о текущем пользователе");
          navigate(ROUTES.LOGIN);
          return;
        }

        // Проверяем, получен ли корректный пользователь из Redux
        if (authUser._id || authUser.id) {
          // Получаем актуальные данные с сервера
          let profileData;

          try {
            // Пытаемся получить данные профиля с сервера
            profileData = await authService.getUserProfile();
            console.log("Получены данные пользователя с сервера:", profileData);

            // Обновляем Redux и localStorage актуальными данными
            dispatch(updateUserData(profileData));

            // Если роль с сервера отличается от роли в localStorage,
            // это может быть признаком атаки. Обновляем все данные.
            if (profileData.role !== authUser.role) {
              console.warn(
                "БЕЗОПАСНОСТЬ: Роль на сервере отличается от локальной, выполняется синхронизация",
                {
                  серверная: profileData.role,
                  локальная: authUser.role,
                }
              );
            }
          } catch (apiError) {
            console.error("Ошибка получения данных с сервера:", apiError);

            // Используем резервные данные из authUser
            profileData = authUser;
            console.log("Используем резервные данные из Redux");
          }

          // Приводим данные к формату User
          const userObj: User = {
            _id: profileData._id || profileData.id || "",
            name: profileData.name || "",
            email: profileData.email || "",
            login: profileData.login || "",
            role: profileData.role as "user" | "admin",
          };

          setUser(userObj as User);
          setName(userObj.name || "");
          setEmail(userObj.email || "");
          setLogin(userObj.login || "");

          // Обновляем сохраненный профиль с правильной ролью
          authService.updateUserData(userObj);

          // Отмечаем, что профиль был загружен
          profileFetchedRef.current = true;
        } else {
          throw new Error("Неверный формат данных пользователя");
        }
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
  }, [dispatch, navigate]);

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

      // Создаем объект с обновленными данными
      const userData: UserUpdateData = {
        name,
        email,
        login,
      };

      // Добавляем пароль только если он был введен
      if (password) {
        userData.password = password;
      }

      try {
        // Обновляем профиль через API
        const updatedUser = await userService.updateUserProfile(userData);

        // Обновляем локальное состояние и Redux
        const userObj: User = {
          _id: updatedUser._id || "",
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          login: updatedUser.login || "",
          role: updatedUser.role as "user" | "admin",
        };

        setUser(userObj);
        dispatch(updateUserData(updatedUser));

        // Убедимся, что флаг остается установленным, чтобы избежать повторной загрузки
        profileFetchedRef.current = true;

        // Показываем сообщение об успехе
        setSuccessMessage("Профиль успешно обновлен");

        // Сбрасываем поля пароля
        setPassword("");
        setConfirmPassword("");
      } catch (apiError) {
        console.error("Ошибка при обновлении через API:", apiError);
        throw apiError;
      }
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

        // Сбрасываем флаг загрузки профиля перед выходом
        profileFetchedRef.current = false;

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

        {error && <div className={styles.error}>{error}</div>}

        {successMessage && (
          <div className={styles.success}>{successMessage}</div>
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
        <p>
          Это действие нельзя будет отменить, и все ваши данные будут удалены.
        </p>
      </Modal>
    </Container>
  );
};

export default Profile;
