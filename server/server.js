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
app.get("/api/seed-admin-once", async (req, res) => {
  const bcrypt = require("bcrypt");
  const { User } = require("./models");
  const existing = await User.findOne({
    where: { email: "admin@stockgate.com" },
  });
  if (existing) return res.json({ message: "Already exists" });
  const passwordHash = await bcrypt.hash("Stk9!gVault#26", 10);
  await User.create({
    name: "Store Owner",
    email: "admin@stockgate.com",
    passwordHash,
  });
  res.json({ message: "Admin created" });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/suppliers", supplierRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.error("Failed to connect to database:", err));
