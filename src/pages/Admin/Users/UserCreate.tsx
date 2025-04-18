import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCreateData, UserUpdateData } from "../../../types/user";
import { userService } from "../../../services/userService";
import UserForm from "./UserForm";
import styles from "../Products/Admin.module.css";

const UserCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Обработчик отправки формы создания
  const handleSubmit = async (userData: UserCreateData | UserUpdateData) => {
    try {
      setIsLoading(true);
      setError(null);
      // Приводим UserUpdateData к UserCreateData, убедившись что все обязательные поля присутствуют
      const createData: UserCreateData = {
        name: userData.name as string,
        email: userData.email as string,
        login: userData.login as string,
        password: userData.password as string,
        role: userData.role as "admin" | "user",
      };
      await userService.createUser(createData);
      navigate("/admin/users");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при создании пользователя");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Создание нового пользователя</h1>
          </div>
          <div className={styles.formBody}>
            <UserForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreate;
