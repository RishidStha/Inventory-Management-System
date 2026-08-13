const root = document.getElementById("root");

let state = {
  page: "dashboard",
  products: [],
  suppliers: [],
  editingProduct: null,
  editingSupplier: null,
};

async function loadData() {
  const [productsRes, suppliersRes] = await Promise.all([
    Api.getProducts(),
    Api.getSuppliers(),
  ]);
  if (productsRes.ok) state.products = productsRes.data;
  if (suppliersRes.ok) state.suppliers = suppliersRes.data;
}

async function navigate(page) {
  state.page = page;

  // Not logged in - render the full-screen auth page, no sidebar at all.
  if (!isLoggedIn()) {
    root.innerHTML = page === "signup" ? renderSignupPage() : renderLoginPage();
    attachAuthTabHandlers();
    if (page !== "signup") attachLoginHandlers();
    return;
  }

  // Logged in - render the sidebar + whichever page content goes inside it.
  let innerHtml = "";

  if (page === "dashboard") {
    await loadData();
    innerHtml = renderDashboard(state);
  } else if (page === "products") {
    await loadData();
    innerHtml = renderProductsPage(state.products);
  } else if (page === "productForm") {
    if (state.suppliers.length === 0) await loadData();
    innerHtml = renderProductForm(state.editingProduct, state.suppliers);
  } else if (page === "suppliers") {
    await loadData();
    innerHtml = renderSuppliersPage(state.suppliers);
  } else if (page === "supplierForm") {
    innerHtml = renderSupplierForm(state.editingSupplier);
  }

  root.innerHTML = renderAppShell(innerHtml, page);
  attachShellHandlers();

  if (page === "dashboard" || page === "products") attachProductListHandlers();
  if (page === "productForm") attachProductFormHandlers();
  if (page === "suppliers") attachSuppliersHandlers();
  if (page === "supplierForm") attachSupplierFormHandlers();
}

// ---------- Auth tabs (Login <-> Sign Up) ----------
function attachAuthTabHandlers() {
  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");
  const goToSignup = document.getElementById("goToSignup");
  const goToLogin = document.getElementById("goToLogin");

  if (tabLogin) tabLogin.addEventListener("click", () => navigate("login"));
  if (tabSignup) tabSignup.addEventListener("click", () => navigate("signup"));
  if (goToSignup)
    goToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("signup");
    });
  if (goToLogin)
    goToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("login");
    });
}

function attachLoginHandlers() {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email)
      return (document.getElementById("emailError").textContent =
        "Email is required.");
    if (!password)
      return (document.getElementById("passwordError").textContent =
        "Password is required.");

    const res = await Api.login(email, password);
    if (!res.ok) {
      document.getElementById("formError").textContent = res.error;
      return;
    }

    setToken(res.data.token);
    navigate("dashboard");
  });
}

// ---------- Sidebar, menu toggle, logout - shared by every logged-in page ----------
function attachShellHandlers() {
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (link.dataset.page === "products") state.editingProduct = null;
      navigate(link.dataset.page);
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearToken();
    navigate("login");
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
}

// ---------- Product grid (dashboard + products page share this) ----------
function attachProductListHandlers() {
  document.querySelectorAll('[data-page="productForm"]').forEach((el) => {
    el.addEventListener("click", () => {
      state.editingProduct = null;
      navigate("productForm");
    });
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
      const res = await Api.getProducts(
        `?search=${encodeURIComponent(e.target.value)}`,
      );
      if (res.ok)
        document.getElementById("productGrid").innerHTML = renderProductCards(
          res.data,
        );
    });
  }

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.editingProduct = state.products.find(
        (p) => p.id == btn.dataset.edit,
      );
      navigate("productForm");
    });
  });

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this product?")) return;
      const res = await Api.deleteProduct(btn.dataset.delete);
      if (!res.ok) return alert(res.error);
      navigate(state.page === "products" ? "products" : "dashboard");
    });
  });
}

// ---------- Product form ----------
function attachProductFormHandlers() {
  document.querySelectorAll('[data-page="products"]').forEach((el) => {
    el.addEventListener("click", () => navigate("products"));
  });

  document
    .getElementById("productForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".form-error")
        .forEach((el) => (el.textContent = ""));

      const name = document.getElementById("name").value.trim();
      const price = document.getElementById("price").value;
      const stockQty = document.getElementById("stockQty").value;
      const supplierId = document.getElementById("supplierId").value;
      let hasError = false;

      if (!name) {
        document.getElementById("nameError").textContent =
          "Product name is required.";
        hasError = true;
      }
      if (price === "" || Number(price) < 0) {
        document.getElementById("priceError").textContent =
          "Enter a valid price (0 or more).";
        hasError = true;
      }
      if (stockQty === "" || Number(stockQty) < 0) {
        document.getElementById("stockQtyError").textContent =
          "Enter a valid stock quantity (0 or more).";
        hasError = true;
      }
      if (!supplierId) {
        document.getElementById("supplierIdError").textContent =
          "Please select a supplier.";
        hasError = true;
      }
      if (hasError) return;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stockQty", stockQty);
      formData.append(
        "lowStockThreshold",
        document.getElementById("lowStockThreshold").value,
      );
      formData.append("supplierId", supplierId);
      formData.append(
        "expiryDate",
        document.getElementById("expiryDate").value,
      );
      const imageFile = document.getElementById("image").files[0];
      if (imageFile) formData.append("image", imageFile);

      const id = document.getElementById("productId").value;
      const res = id
        ? await Api.updateProduct(id, formData)
        : await Api.createProduct(formData);

      if (!res.ok) {
        document.getElementById("formError").textContent = res.error;
        if (res.fields) {
          Object.entries(res.fields).forEach(([field, msg]) => {
            const el = document.getElementById(`${field}Error`);
            if (el) el.textContent = msg;
          });
        }
        return;
      }

      state.editingProduct = null;
      navigate("products");
    });
}

// ---------- Suppliers ----------
function attachSuppliersHandlers() {
  document.querySelectorAll('[data-page="supplierForm"]').forEach((el) => {
    el.addEventListener("click", () => {
      state.editingSupplier = null;
      navigate("supplierForm");
    });
  });

  document.querySelectorAll("[data-edit-supplier]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.editingSupplier = state.suppliers.find(
        (s) => s.id == btn.dataset.editSupplier,
      );
      navigate("supplierForm");
    });
  });

  document.querySelectorAll("[data-delete-supplier]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this supplier?")) return;
      const res = await Api.deleteSupplier(btn.dataset.deleteSupplier);
      if (!res.ok) return alert(res.error);
      navigate("suppliers");
    });
  });
}

function attachSupplierFormHandlers() {
  document.querySelectorAll('[data-page="suppliers"]').forEach((el) => {
    el.addEventListener("click", () => navigate("suppliers"));
  });

  document
    .getElementById("supplierForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".form-error")
        .forEach((el) => (el.textContent = ""));

      const name = document.getElementById("name").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
      let hasError = false;

      if (!name) {
        document.getElementById("nameError").textContent =
          "Supplier name is required.";
        hasError = true;
      }
      if (!/^\d{7,15}$/.test(mobile)) {
        document.getElementById("mobileError").textContent =
          "Enter a valid mobile number (7-15 digits).";
        hasError = true;
      }
      if (hasError) return;

      const body = {
        name,
        mobile,
        vatNo: document.getElementById("vatNo").value.trim(),
        address: document.getElementById("address").value.trim(),
      };

      const id = document.getElementById("supplierId").value;
      const res = id
        ? await Api.updateSupplier(id, body)
        : await Api.createSupplier(body);

      if (!res.ok) {
        document.getElementById("formError").textContent = res.error;
        if (res.fields) {
          Object.entries(res.fields).forEach(([field, msg]) => {
            const el = document.getElementById(`${field}Error`);
            if (el) el.textContent = msg;
          });
        }
        return;
      }

      state.editingSupplier = null;
      navigate("suppliers");
    });
}

// ---------- Init ----------
navigate("dashboard");
