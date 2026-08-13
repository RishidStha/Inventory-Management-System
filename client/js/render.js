// render.js - pure functions: given data, return an HTML string.
// No fetching, no event listeners - main.js handles those.

function renderAppShell(innerHtml, activePage) {
  const isActive = (page) => (activePage === page ? "active" : "");

  return `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="logo">
          <img src="img/logo.png" alt="StockGate logo" class="logo-img" />
          <span>StockGate</span>
        </div>
        <nav>
          <a href="#" data-page="dashboard" class="nav-link ${isActive("dashboard")}">Dashboard</a>
          <a href="#" data-page="products" class="nav-link ${isActive("products") || activePage === "productForm" ? "active" : ""}">Products</a>
          <a href="#" data-page="suppliers" class="nav-link ${isActive("suppliers") || activePage === "supplierForm" ? "active" : ""}">Suppliers</a>
        </nav>
        <button id="logoutBtn" class="logout-btn">Log out</button>
      </aside>

      <button id="menuToggle" class="menu-toggle">☰</button>

      <main class="content" id="content">
        ${innerHtml}
      </main>
    </div>
  `;
}

function renderLoginPage() {
  return `
    <div class="auth-page">
      <div class="auth-side">
        <div class="brand-icon">📦</div>
        <h1>StockGate</h1>
        <p>Simple inventory management built for small stores. Track stock, suppliers, and never run out unexpectedly.</p>
      </div>
      <div class="auth-form-side">
        <div class="auth-box">
          <div class="auth-tabs">
            <button class="active" id="tabLogin">Login</button>
            <button id="tabSignup">Sign Up</button>
          </div>
          <h2>Welcome back</h2>
          <p class="subtitle">Log in to manage your inventory.</p>
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="you@example.com" required />
              <span class="form-error" id="emailError"></span>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Enter password" required />
              <span class="form-error" id="passwordError"></span>
            </div>
            <span class="form-error" id="formError"></span>
            <button type="submit" class="btn accent">Login</button>
          </form>
          <p class="auth-switch">Don't have an account? <a href="#" id="goToSignup">Sign Up</a></p>
        </div>
      </div>
    </div>
  `;
}

function renderSignupPage() {
  return `
    <div class="auth-page">
      <div class="auth-side">
        <div class="brand-icon">📦</div>
        <h1>StockGate</h1>
        <p>Inventory management for small stores. Set up your account to get started.</p>
      </div>
      <div class="auth-form-side">
        <div class="auth-box">
          <div class="auth-tabs">
            <button id="tabLogin">Login</button>
            <button class="active" id="tabSignup">Sign Up</button>
          </div>
          <h2>Create your account</h2>
          <p class="subtitle">Registration is not enabled yet - use the seeded admin login for now.</p>
          <form id="signupForm">
            <div class="form-group">
              <label for="storeName">Store Name</label>
              <input type="text" id="storeName" placeholder="e.g. StockGate" disabled />
            </div>
            <div class="form-group">
              <label for="ownerName">Owner Name</label>
              <input type="text" id="ownerName" placeholder="Full Name" disabled />
            </div>
            <div class="form-group">
              <label for="signupEmail">Email</label>
              <input type="email" id="signupEmail" placeholder="you@example.com" disabled />
            </div>
            <div class="form-group">
              <label for="signupPassword">Password</label>
              <input type="password" id="signupPassword" placeholder="Enter password" disabled />
            </div>
            <button type="button" class="btn accent" disabled style="opacity:0.5; cursor:not-allowed;">Create Account</button>
          </form>
          <p class="auth-switch">Already have an account? <a href="#" id="goToLogin">Login</a></p>
        </div>
      </div>
    </div>
  `;
}

function renderDashboard({ products, suppliers }) {
  const lowStockCount = products.filter(
    (p) => p.status === "Low Stock" || p.status === "Out of Stock",
  ).length;

  return `
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card"><h3>Total Items</h3><div class="value">${products.length}</div></div>
      <div class="stat-card accent"><h3>Suppliers</h3><div class="value">${suppliers.length}</div></div>
      <div class="stat-card danger"><h3>Low Stock</h3><div class="value">${lowStockCount}</div></div>
    </div>
    <div class="toolbar">
      <input type="text" id="searchInput" placeholder="Search products..." />
      <button class="btn accent" data-page="productForm">+ Add Product</button>
    </div>
    <div class="grid" id="productGrid">${renderProductCards(products)}</div>
  `;
}

function renderProductsPage(products) {
  return `
    <h1>Products</h1>
    <div class="toolbar">
      <input type="text" id="searchInput" placeholder="Search products..." />
      <button class="btn accent" data-page="productForm">+ Add Product</button>
    </div>
    <div class="grid" id="productGrid">${renderProductCards(products)}</div>
  `;
}

function renderProductCards(products) {
  if (products.length === 0) return `<p>No products yet.</p>`;

  return products
    .map((p) => {
      const statusClass = p.status.toLowerCase().replace(/\s+/g, "-");
      return `
        <div class="product-card ${statusClass}" data-id="${p.id}">
          <img src="${p.imagePath ? "http://localhost:5000" + p.imagePath : ""}" onerror="this.style.background='#ddd'" />
          <div class="info">
            <strong>${p.name}</strong>
            <div>Rs ${p.price}</div>
            <div style="font-size:0.8rem; color:#666;">${p.Supplier ? p.Supplier.name : "No supplier"}</div>
            <div class="status ${statusClass}">${p.status} · ${p.stockQty} in stock</div>
            <div style="margin-top:8px; display:flex; gap:6px;">
              <button class="btn" style="padding:6px 10px;" data-edit="${p.id}">Edit</button>
              <button class="btn danger" style="padding:6px 10px;" data-delete="${p.id}">Delete</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderProductForm(product = null, suppliers = []) {
  const supplierOptions = suppliers
    .map(
      (s) =>
        `<option value="${s.id}" ${product?.supplierId === s.id ? "selected" : ""}>${s.name}</option>`,
    )
    .join("");

  return `
    <div class="form-page">
      <h2>${product ? "Edit" : "Add"} Product</h2>
      <form id="productForm">
        <input type="hidden" id="productId" value="${product?.id || ""}" />
        <div class="form-group">
          <label>Product Name</label>
          <input type="text" id="name" value="${product?.name || ""}" required />
          <span class="form-error" id="nameError"></span>
        </div>
        <div class="form-group">
          <label>Price (Rs)</label>
          <input type="number" id="price" min="0" step="0.01" value="${product?.price || ""}" required />
          <span class="form-error" id="priceError"></span>
        </div>
        <div class="form-group">
          <label>Stock Quantity</label>
          <input type="number" id="stockQty" min="0" value="${product?.stockQty ?? ""}" required />
          <span class="form-error" id="stockQtyError"></span>
        </div>
        <div class="form-group">
          <label>Low Stock Threshold</label>
          <input type="number" id="lowStockThreshold" min="0" value="${product?.lowStockThreshold || 5}" />
        </div>
        <div class="form-group">
          <label>Supplier</label>
          <select id="supplierId" required>
            <option value="">-- Select supplier --</option>
            ${supplierOptions}
          </select>
          <span class="form-error" id="supplierIdError"></span>
        </div>
        <div class="form-group">
          <label>Expiry Date (optional)</label>
          <input type="date" id="expiryDate" value="${product?.expiryDate || ""}" />
        </div>
        <div class="form-group">
          <label>Product Image</label>
          <input type="file" id="image" accept="image/png,image/jpeg,image/webp" />
        </div>
        <span class="form-error" id="formError"></span>
        <div style="display:flex; gap:10px;">
          <button type="submit" class="btn accent">Save</button>
          <button type="button" class="btn" data-page="products">Cancel</button>
        </div>
      </form>
    </div>
  `;
}

function renderSuppliersPage(suppliers) {
  const rows = suppliers
    .map(
      (s) => `
      <tr>
        <td>${s.name}</td>
        <td>${s.mobile}</td>
        <td>${s.vatNo || "-"}</td>
        <td>${s.productsSuppliedCount}</td>
        <td>
          <button class="btn" style="padding:6px 10px;" data-edit-supplier="${s.id}">Edit</button>
          <button class="btn danger" style="padding:6px 10px;" data-delete-supplier="${s.id}">Delete</button>
        </td>
      </tr>`,
    )
    .join("");

  return `
    <h1>Suppliers</h1>
    <div class="toolbar">
      <div></div>
      <button class="btn accent" data-page="supplierForm">+ Add Supplier</button>
    </div>
    <table>
      <thead><tr><th>Name</th><th>Mobile</th><th>VAT No</th><th>Products Supplied</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">No suppliers yet.</td></tr>'}</tbody>
    </table>
  `;
}

function renderSupplierForm(supplier = null) {
  return `
    <div class="form-page">
      <h2>${supplier ? "Edit" : "Add"} Supplier</h2>
      <form id="supplierForm">
        <input type="hidden" id="supplierId" value="${supplier?.id || ""}" />
        <div class="form-group">
          <label>Supplier Name</label>
          <input type="text" id="name" value="${supplier?.name || ""}" required />
          <span class="form-error" id="nameError"></span>
        </div>
        <div class="form-group">
          <label>Mobile Number</label>
          <input type="text" id="mobile" value="${supplier?.mobile || ""}" required />
          <span class="form-error" id="mobileError"></span>
        </div>
        <div class="form-group">
          <label>VAT No (optional)</label>
          <input type="text" id="vatNo" value="${supplier?.vatNo || ""}" />
        </div>
        <div class="form-group">
          <label>Address (optional)</label>
          <input type="text" id="address" value="${supplier?.address || ""}" />
        </div>
        <span class="form-error" id="formError"></span>
        <div style="display:flex; gap:10px;">
          <button type="submit" class="btn accent">Save</button>
          <button type="button" class="btn" data-page="suppliers">Cancel</button>
        </div>
      </form>
    </div>
  `;
}
