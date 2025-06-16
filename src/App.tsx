import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { useAuth } from "./hooks/useAuth";
import { ROUTES } from "./constants/routes";
import "./styles/global.css";
import { GlobalNotification } from "./components/GlobalNotification";
import SecurityProvider from "./components/SecurityProvider";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProductList from "./pages/Admin/Products/ProductList";
import ProductCreate from "./pages/Admin/Products/ProductCreate";
import ProductEdit from "./pages/Admin/Products/ProductEdit";
import ProductCatalog from "./pages/ProductCatalog/ProductCatalog";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import AllProducts from "./pages/AllProducts/AllProducts";
import ErrorPage from "./pages/ErrorPage";
import CategoryListContainer from "./pages/Admin/Categories";
import Cart from "./pages/Cart/Cart";
import AdminUsers from "./pages/Admin/Users/Users";
import { Profile } from "./pages/Profile/Profile";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      console.error(
        "ВНИМАНИЕ: Обнаружена попытка доступа к административному маршруту неавторизованным пользователем"
      );
      navigate(ROUTES.ACCESS_DENIED);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.ACCESS_DENIED} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SecurityProvider>
        <ThemeProvider>
          <div className="app">
            <Layout>
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.CATALOG} element={<ProductCatalog />} />
                <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
                <Route
                  path={ROUTES.PRODUCT_DETAIL}
                  element={<ProductDetail />}
                />
                <Route path={ROUTES.ALL_PRODUCTS} element={<AllProducts />} />
                <Route
                  path={ROUTES.CART}
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.ACCESS_DENIED}
                  element={<ErrorPage type="access-denied" />}
                />
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN.PRODUCTS}
                  element={
                    <AdminRoute>
                      <ProductList />
                    </AdminRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN.PRODUCT_CREATE}
                  element={
                    <AdminRoute>
                      <ProductCreate />
                    </AdminRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN.PRODUCT_EDIT}
                  element={
                    <AdminRoute>
                      <ProductEdit />
                    </AdminRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN.CATEGORIES}
                  element={
                    <AdminRoute>
                      <CategoryListContainer />
                    </AdminRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN.USERS + "/*"}
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<ErrorPage type="not-found" />} />
              </Routes>
            </Layout>
            <GlobalNotification />
          </div>
        </ThemeProvider>
      </SecurityProvider>
    </Router>
  );
};

export default App;
