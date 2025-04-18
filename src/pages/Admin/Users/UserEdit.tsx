import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, UserUpdateData } from "../../../types/user";
import { userService } from "../../../services/userService";
import UserForm from "./UserForm";
import styles from "../Products/Admin.module.css";
import { Loader } from "../../../components";

const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователя
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const userData = await userService.getUserById(id);
        setUser(userData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Произошла ошибка при загрузке пользователя");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Обработчик отправки формы редактирования
  const handleSubmit = async (userData: UserUpdateData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      setError(null);
      await userService.updateUser(id, userData);
      navigate("/admin/users");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при обновлении пользователя");
      }
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader message="Загрузка пользователя..." />;
  }

  if (!user && !isLoading) {
    return (
      <div className={styles.error}>
        Пользователь не найден или произошла ошибка при загрузке данных.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Редактирование пользователя</h1>
          </div>
          <div className={styles.formBody}>
            {user && (
              <UserForm
                user={user}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
