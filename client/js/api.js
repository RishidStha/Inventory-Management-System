const API_BASE = "http://https://stockgate-api.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function isLoggedIn() {
  return !!getToken();
}

// Central fetch wrapper: adds the JWT automatically, and always
// returns { ok, data } so calling code never has to repeat try/catch.
async function apiRequest(
  path,
  { method = "GET", body, isFormData = false } = {},
) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || "Something went wrong.",
        fields: data.fields || {},
      };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: "Could not reach the server. Is it running?",
    };
  }
}

const Api = {
  login: (email, password) =>
    apiRequest("/auth/login", { method: "POST", body: { email, password } }),

  getProducts: (params = "") => apiRequest(`/products${params}`),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createProduct: (formData) =>
    apiRequest("/products", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
  updateProduct: (id, formData) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: formData,
      isFormData: true,
    }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),

  getSuppliers: () => apiRequest("/suppliers"),
  createSupplier: (body) => apiRequest("/suppliers", { method: "POST", body }),
  updateSupplier: (id, body) =>
    apiRequest(`/suppliers/${id}`, { method: "PUT", body }),
  deleteSupplier: (id) => apiRequest(`/suppliers/${id}`, { method: "DELETE" }),
};
