import React, { useState, useEffect } from "react";
import { User, UserCreateData, UserUpdateData } from "../../../types/user";
import styles from "../Products/Admin.module.css";

interface UserFormProps {
  user?: User;
  onSubmit: (user: UserCreateData | UserUpdateData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  isLoading,
  error,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  // Заполнение формы при наличии редактируемого пользователя
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setLogin(user.login);
      setPassword(""); // Пароль не заполняем при редактировании
      setRole(user.role);
    }
  }, [user]);

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData: UserCreateData | UserUpdateData = {
      name,
      email,
      login,
      role,
    };

    // Добавляем пароль только если он был введен
    if (password) {
      userData.password = password;
    }

    await onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Имя
        </label>
        <input
          id="name"
          type="text"
          className={styles.input}
          placeholder="Введите имя пользователя"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
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
          placeholder="Введите email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
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
          placeholder="Введите логин"
          value={login}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLogin(e.target.value)
          }
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Пароль {user ? "(оставьте пустым, чтобы не менять)" : ""}
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          placeholder="Введите пароль"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required={!user} // Пароль обязателен только при создании
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="role" className={styles.label}>
          Роль
        </label>
        <select
          id="role"
          className={styles.select}
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRole(e.target.value as "admin" | "user")
          }
          required
        >
          <option value="user">Пользователь</option>
          <option value="admin">Администратор</option>
        </select>
      </div>

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? "Сохранение..." : "Сохранить"}
      </button>
    </form>
  );
};

export default UserForm;
