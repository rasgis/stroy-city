import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, clearError } from "../../reducers/authSlice";
import { ROUTES } from "../../constants/routes";
import styles from "./Auth.module.css";

const validationSchema = Yup.object({
  identifier: Yup.string()
    .required("Обязательное поле")
    .min(3, "Минимум 3 символа"),
  password: Yup.string()
    .required("Обязательное поле")
    .min(6, "Минимум 6 символов"),
});

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        navigate(ROUTES.HOME);
      } catch (error) {
        console.error("Ошибка входа:", error);
        // Ошибка уже обработана в authSlice и установлена в state.error
      }
    },
  });

  // Очищаем ошибку при размонтировании компонента
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Вход</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="identifier">Email или логин</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.identifier}
              className={
                formik.touched.identifier && formik.errors.identifier
                  ? styles.error
                  : ""
              }
              placeholder="Введите email или логин"
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <div className={styles.errorMessage}>
                {formik.errors.identifier}
              </div>
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
              placeholder="Введите пароль"
            />
            {formik.touched.password && formik.errors.password && (
              <div className={styles.errorMessage}>
                {formik.errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className={styles.switchAuth}>
          Нет аккаунта?{" "}
          <Link to={ROUTES.REGISTER} onClick={() => dispatch(clearError())}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
