const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

// Reading suppliers is public (needed for dropdowns etc.),
// but creating/editing/deleting requires a logged-in admin.
router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.post("/", requireAuth, createSupplier);
router.put("/:id", requireAuth, updateSupplier);
router.delete("/:id", requireAuth, deleteSupplier);

module.exports = router;
