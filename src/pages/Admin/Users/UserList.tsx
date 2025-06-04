import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaUserCog } from "react-icons/fa";
import { User } from "../../../types/user";
import { userService } from "../../../services/userService";
import styles from "../Products/Admin.module.css";
import { Loader } from "../../../components";
import { Modal } from "../../../components/Modal/Modal";

const tableStyles = {
  tr: {
    transition: "none",
  },
  td: {
    transition: "none",
  },
  trHover: {
    transform: "none",
    background: "none",
    boxShadow: "none",
  },
};

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");

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

  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser._id, {
        ...selectedUser,
        role: selectedRole,
      });
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers(); 
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при изменении роли пользователя");
      }
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); 
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка при удалении пользователя");
      }
    }
  };

  const renderUserRow = (user: User) => {
    return (
      <tr key={user._id} style={tableStyles.tr}>
        <td style={tableStyles.td}>{user.name}</td>
        <td style={tableStyles.td}>{user.email}</td>
        <td style={tableStyles.td}>{user.login}</td>
        <td style={tableStyles.td}>
          <span
            className={
              user.role === "admin" ? styles.adminRole : styles.userRole
            }
          >
            {user.role === "admin" ? "Администратор" : "Пользователь"}
          </span>
        </td>
        <td style={tableStyles.td}>
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={() => handleRoleClick(user)}
              title="Изменить роль"
            >
              <FaUserCog />
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => handleDeleteClick(user)}
              title="Удалить пользователя"
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
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <Loader message="Загрузка пользователей..." />
      ) : (
        <div className={styles.tableResponsive}>
          <table className={`${styles.table} ${styles.userList}`}>
            <thead>
              <tr>
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

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Изменение роли пользователя"
        type="default"
        onConfirm={handleRoleChange}
        confirmText="Сохранить"
      >
        <p>Выберите роль для пользователя: {selectedUser?.email}</p>
        <div className={styles.roleSelector}>
          <label className={styles.roleLabel}>
            <input
              type="radio"
              name="role"
              value="user"
              checked={selectedRole === "user"}
              onChange={() => setSelectedRole("user")}
            />
            Пользователь
          </label>
          <label className={styles.roleLabel}>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={selectedRole === "admin"}
              onChange={() => setSelectedRole("admin")}
            />
            Администратор
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
