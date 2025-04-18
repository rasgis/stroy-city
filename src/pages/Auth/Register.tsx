import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { register } from "../../reducers/authSlice";
import { ROUTES } from "../../constants/routes";
import styles from "./Auth.module.css";

const validationSchema = Yup.object({
  name: Yup.string().required("Обязательное поле").min(2, "Минимум 2 символа"),
  email: Yup.string()
    .email("Введите корректный email")
    .required("Обязательное поле"),
  login: Yup.string()
    .required("Обязательное поле")
    .min(3, "Минимум 3 символа")
    .matches(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и подчеркивание"),
  password: Yup.string()
    .required("Обязательное поле")
    .min(6, "Минимум 6 символов"),
  confirmPassword: Yup.string()
    .required("Обязательное поле")
    .oneOf([Yup.ref("password")], "Пароли не совпадают"),
});

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      login: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        await dispatch(register(registerData)).unwrap();
        navigate(ROUTES.HOME);
      } catch (error) {
        console.error("Ошибка регистрации:", error);
      }
    },
  });

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Регистрация</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={
                formik.touched.name && formik.errors.name ? styles.error : ""
              }
            />
            {formik.touched.name && formik.errors.name && (
              <div className={styles.errorMessage}>{formik.errors.name}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={
                formik.touched.email && formik.errors.email ? styles.error : ""
              }
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorMessage}>{formik.errors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              name="login"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.login}
              className={
                formik.touched.login && formik.errors.login ? styles.error : ""
              }
            />
            {formik.touched.login && formik.errors.login && (
              <div className={styles.errorMessage}>{formik.errors.login}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={
                formik.touched.password && formik.errors.password
                  ? styles.error
                  : ""
              }
            />
            {formik.touched.password && formik.errors.password && (
              <div className={styles.errorMessage}>
                {formik.errors.password}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className={
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? styles.error
                  : ""
              }
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className={styles.errorMessage}>
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className={styles.switchAuth}>
          Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
