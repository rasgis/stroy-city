import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { login, clearError } from "../../reducers/authSlice";
import { ROUTES } from "../../constants/routes";
import styles from "./Auth.module.css";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

const validationSchema = Yup.object({
  identifier: Yup.string().required("Введите email или логин"),
  password: Yup.string().required("Введите пароль"),
});

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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

      }
    },
  });

  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [formik.values, dispatch, error]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2>Вход в систему</h2>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="identifier">Email или Логин</label>
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
