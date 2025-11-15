// lib/api.js - Centralized API helper with authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get image URL from storage path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return `${API_BASE_URL}/storage/${imagePath}`;
};

/**
 * Format number without unnecessary decimals
 * Example: 25000.00 → "25.000", 25000.50 → "25.000,50"
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "0";

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "0";

  // Check if number has decimal part
  const hasDecimal = numValue % 1 !== 0;

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  }).format(numValue);
};

/**
 * Format currency without unnecessary decimals
 * Example: 25000.00 → "Rp 25.000", 25000.50 → "Rp 25.000,50"
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "Rp 0";

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "Rp 0";

  // Check if number has decimal part
  const hasDecimal = numValue % 1 !== 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  }).format(numValue);
};

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    // Check both "token" and "auth_token" for backward compatibility
    return localStorage.getItem("token") || localStorage.getItem("auth_token");
  }
  return null;
};

/**
 * Set auth token to localStorage
 */
export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    // Store in both places for compatibility
    localStorage.setItem("token", token);
    localStorage.setItem("auth_token", token);
  }
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
  }
};

/**
 * Fetch with authentication
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response is OK
    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new Error("Unauthorized. Please login again.");
      }

      // Clone response untuk bisa dibaca sebagai text jika perlu
      const errorResponseClone = response.clone();

      // Try to parse error message
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        } catch (jsonError) {
          // Jika JSON parsing gagal, mungkin response adalah HTML
          const text = await errorResponseClone.text();
          if (
            text.trim().startsWith("<!DOCTYPE") ||
            text.trim().startsWith("<html")
          ) {
            throw new Error(
              `Server error (${response.status}). Pastikan endpoint ${endpoint} tersedia dan server backend berjalan di ${API_BASE_URL}`
            );
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        // Response bukan JSON, coba baca sebagai text
        const text = await errorResponseClone.text();
        if (
          text.trim().startsWith("<!DOCTYPE") ||
          text.trim().startsWith("<html")
        ) {
          throw new Error(
            `Server error (${response.status}). Pastikan endpoint ${endpoint} tersedia dan server backend berjalan di ${API_BASE_URL}`
          );
        }
        throw new Error(
          `HTTP error! status: ${response.status}. Response: ${text.substring(
            0,
            100
          )}`
        );
      }
    }

    // Check content type dan parse response
    const contentType = response.headers.get("content-type");

    // Clone response untuk bisa dibaca beberapa kali jika perlu
    const responseClone = response.clone();

    if (!contentType || !contentType.includes("application/json")) {
      const text = await responseClone.text();
      console.error("Received non-JSON response:", text.substring(0, 200));

      // Jika response adalah HTML (error page), berikan pesan error yang lebih jelas
      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error(
          `Server mengembalikan halaman error. Pastikan endpoint ${endpoint} tersedia dan server backend berjalan di ${API_BASE_URL}. Status: ${response.status}`
        );
      }

      throw new Error(
        `Expected JSON but received: ${
          contentType || "unknown"
        }. Response: ${text.substring(0, 100)}`
      );
    }

    try {
      return await response.json();
    } catch (jsonError) {
      // Jika JSON parsing gagal, coba baca sebagai text untuk debug
      const text = await responseClone.text();
      console.error("JSON parse error. Response text:", text.substring(0, 500));
      throw new Error(
        `Invalid JSON response from server: ${jsonError.message}`
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/login",
  LOGOUT: "/api/logout",
  FORGOT_PASSWORD: "/api/forgot-password",
  RESET_PASSWORD: "/api/reset-password",
  CHANGE_PASSWORD: "/api/change-password",
  USER_PROFILE: "/api/user-profile",

  // Dashboard
  DASHBOARD_SUMMARY: "/api/dashboard/summary",
  DASHBOARD_LATEST_TRANSACTIONS: "/api/dashboard/latest-transactions",
  DASHBOARD_TOP_PRODUCTS: "/api/dashboard/top-products",
  DASHBOARD_LOW_STOCK: "/api/dashboard/low-stock",
  DASHBOARD_SALES_CHART: "/api/dashboard/sales-chart",

  // Products
  PRODUCTS: "/api/products",
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,

  // Categories
  CATEGORIES: "/api/categories",
  CATEGORY_BY_ID: (id) => `/api/categories/${id}`,
  CATEGORY_PRODUCTS: (id) => `/api/categories/${id}/products`,

  // Transactions
  TRANSACTIONS: "/api/transactions",
  TRANSACTION_BY_ID: (id) => `/api/transactions/${id}`,
  TRANSACTIONS_EXPORT_EXCEL: "/api/transactions/export/excel",
  TRANSACTIONS_EXPORT_PDF: "/api/transactions/export/pdf",

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,
  USER_RESET_PASSWORD: (id) => `/api/users/${id}/reset-password`,

  // Cashflow
  CASHFLOWS: "/api/cashflows",
  CASHFLOW_SUMMARY: "/api/cashflow/summary",
  CASHFLOW_CATEGORIES: "/api/cashflow/categories",
  CASHFLOW_METHODS: "/api/cashflow/methods",

  // Profit
  PROFIT: "/api/profit",
  PROFIT_YEARLY_CHART: "/api/profit/yearly-chart",
  PROFIT_COMPARISON: "/api/profit/comparison",
  PROFIT_EXPORT_PDF: "/api/profit/export/pdf",
  PROFIT_EXPORT_EXCEL: "/api/profit/export/excel",

  // Cashflow Export
  CASHFLOW_EXPORT_PDF: "/api/cashflow/export/pdf",
  CASHFLOW_EXPORT_EXCEL: "/api/cashflow/export/excel",

  // Shift
  SHIFT_ACTIVE: "/api/shift/active",
  SHIFT_GET_OR_CREATE: "/api/shift/get-or-create",
  SHIFT_CLOSE: "/api/shift/close",
};

/**
 * API Methods
 */
export const api = {
  // GET request
  get: async (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const response = await fetchWithAuth(url, { method: "GET" });

    // Handle both response formats:
    // 1. {success: true, data: ..., meta: ...} - return full response if meta exists (for pagination)
    // 2. {success: true, data: ..., message: ...} - extract data (message is just info)
    // 3. Direct data (array/object) - return as is
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      "data" in response
    ) {
      // Only return full response if meta exists (for pagination)
      // Otherwise extract data (even if there's a message field)
      if ("meta" in response) {
        return response;
      }
      return response.data;
    }
    return response;
  },

  // POST request
  post: async (endpoint, data = {}) => {
    // Login endpoint menggunakan format khusus (tanpa wrapper success/data)
    const isLoginEndpoint = endpoint === API_ENDPOINTS.LOGIN;

    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Login endpoint return format: {message, token, user, shift}
    if (isLoginEndpoint) {
      return response; // Return langsung untuk login
    }

    // Handle both response formats untuk endpoint lain
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      "data" in response
    ) {
      return response.data;
    }
    return response;
  },

  // PUT request
  put: async (endpoint, data = {}) => {
    const response = await fetchWithAuth(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    // Handle both response formats
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      "data" in response
    ) {
      return response.data;
    }
    return response;
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetchWithAuth(endpoint, { method: "DELETE" });

    // Handle both response formats
    if (
      response &&
      typeof response === "object" &&
      "success" in response &&
      "data" in response
    ) {
      return response.data;
    }
    return response;
  },

  // POST with FormData (for file uploads)
  postFormData: async (endpoint, formData, method = "POST") => {
    const token = getAuthToken();
    const headers = {
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Laravel method spoofing untuk PUT/PATCH dengan FormData
    if (method !== "POST") {
      formData.append("_method", method);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST", // Always use POST for FormData, Laravel will handle _method
      headers,
      body: formData,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new Error("Unauthorized. Please login again.");
      }

      // Try to parse error message
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    // Handle both response formats (same as post/put)
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "data" in responseData
    ) {
      return responseData.data;
    }
    return responseData;
  },
};

// Auth specific methods
export const auth = {
  login: async (username, password) => {
    const data = await api.post(API_ENDPOINTS.LOGIN, { username, password });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } finally {
      removeAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  getProfile: async () => {
    return api.get(API_ENDPOINTS.USER_PROFILE);
  },

  changePassword: async (
    currentPassword,
    newPassword,
    newPasswordConfirmation
  ) => {
    return api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  },
};

export default api;
