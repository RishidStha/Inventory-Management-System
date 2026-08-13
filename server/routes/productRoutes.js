const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const upload = require("../config/upload");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", requireAuth, upload.single("image"), createProduct);
router.put("/:id", requireAuth, upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

module.exports = router;
