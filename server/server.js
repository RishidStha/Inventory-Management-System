require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const supplierRoutes = require("./routes/supplierRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const { sequelize } = require("./models");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/suppliers", supplierRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

const bcrypt = require("bcrypt");
const { User } = require("./models");

async function ensureAdminExists() {
  const email = "admin@stockgate.com";
  const existing = await User.findOne({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Stk9!gVault#26", 10);
    await User.create({ name: "Store Owner", email, passwordHash });
    console.log("Admin user auto-created.");
  }
}

sequelize
  .sync()
  .then(async () => {
    await ensureAdminExists();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.error("Failed to connect to database:", err));
