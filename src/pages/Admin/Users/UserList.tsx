import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { User } from "../../../types/user";
import { userService } from "../../../services/userService";
import styles from "../Products/Admin.module.css";
import { Loader, EntityForm } from "../../../components";
import { Modal } from "../../../components/Modal/Modal";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при загрузке пользователей");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработчик открытия модального окна для добавления пользователя
  const handleAddUser = () => {
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  // Обработчик открытия модального окна для редактирования пользователя
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  // Обработчик закрытия модального окна формы
  const handleFormClose = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
  };

  // Обработчик успешного сохранения пользователя
  const handleUserSaved = () => {
    fetchUsers();
    setIsFormModalOpen(false);
    setUserToEdit(null);
  };

  // Обработчик открытия модального окна удаления
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Обработчик удаления пользователя
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Перезагрузка списка пользователей
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при удалении пользователя");
      }
    }
  };

  // Рендеринг строки таблицы для пользователя
  const renderUserRow = (user: User) => {
    return (
      <tr key={user._id}>
        <td>{user._id}</td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.login}</td>
        <td>
          <span
            className={
              user.role === "admin" ? styles.adminRole : styles.userRole
            }
          >
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </span>
        </td>
        <td>
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={() => handleEditUser(user)}
            >
              <FaEdit />
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteClick(user)}
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Управление пользователями</h2>
        <button onClick={handleAddUser} className={styles.addButton}>
          <FaPlus className={styles.addIcon} />
          Добавить пользователя
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <Loader message="Загрузка пользователей..." />
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map(renderUserRow)
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удаление пользователя"
        type="delete"
        onConfirm={handleDeleteConfirm}
        confirmText="Удалить"
      >
        <p>
          Вы действительно хотите удалить пользователя "{selectedUser?.email}"?
        </p>
        <p>Это действие нельзя будет отменить.</p>
      </Modal>

      <EntityForm
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        entityType="user"
        entityData={
          userToEdit
            ? {
                name: userToEdit.name,
                email: userToEdit.email,
                login: userToEdit.login,
                password: userToEdit._id ? "" : "", // Пустой пароль при редактировании
                role: userToEdit.role,
                _id: userToEdit._id,
              }
            : undefined
        }
        afterSubmit={handleUserSaved}
      />
    </div>
  );
};

export default UserList;
