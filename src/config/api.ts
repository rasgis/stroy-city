const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return "";
  }
  return "http://localhost:3001";
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      PROFILE: "/api/auth/profile",
    },
    USERS: {
      BASE: "/api/users",
      BY_ID: (id: string) => `/api/users/${id}`,
    },
    PRODUCTS: {
      BASE: "/api/products",
      BY_ID: (id: string) => `/api/products/${id}`,
    },
    CATEGORIES: {
      BASE: "/api/categories",
      BY_ID: (id: string) => `/api/categories/${id}`,
    },
    FILES: {
      UPLOAD: "/api/upload",
    },
  },
  HEADERS: {
    "Content-Type": "application/json",
  },
};

export const getApiUrl = (endpoint: string) =>
  `${API_CONFIG.BASE_URL}${endpoint}`;
