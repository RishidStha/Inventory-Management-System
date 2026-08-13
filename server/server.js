require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const supplierRoutes = require("./routes/supplierRoutes");
const authRoutes = require("./routes/authRoutes");

const { sequelize } = require("./models");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/suppliers", supplierRoutes);
app.use("/api/auth", authRoutes);

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
