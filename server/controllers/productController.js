const { Op } = require("sequelize");
const { Product, Supplier } = require("../models");

// Works out Good / Low Stock / Out of Stock / Expired without storing it
// redundantly - it's derived from stockQty and expiryDate every time we read it.
function computeStatus(product) {
  const today = new Date().toISOString().slice(0, 10);
  if (product.expiryDate && product.expiryDate < today) return "Expired";
  if (product.stockQty === 0) return "Out of Stock";
  if (product.stockQty <= product.lowStockThreshold) return "Low Stock";
  return "Good";
}

function attachStatus(product) {
  const plain = product.toJSON();
  return { ...plain, status: computeStatus(plain) };
}

// GET /api/products?search=&supplierId=
exports.getAllProducts = async (req, res) => {
  const { search, supplierId } = req.query;
  const where = {};

  if (search) where.name = { [Op.like]: `%${search}%` };
  if (supplierId) where.supplierId = supplierId;

  try {
    const products = await Product.findAll({
      where,
      include: [{ model: Supplier, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(products.map(attachStatus));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch products." });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Supplier, attributes: ["id", "name"] }],
    });
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(attachStatus(product));
  } catch (err) {
    res.status(500).json({ error: "Could not fetch product." });
  }
};

function validateProductInput(body) {
  const errors = {};
  const { name, price, stockQty, supplierId } = body;

  if (!name || !name.trim()) errors.name = "Product name is required.";
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    errors.price = "Price must be a number of 0 or more.";
  }
  if (stockQty === undefined || isNaN(stockQty) || Number(stockQty) < 0) {
    errors.stockQty = "Stock quantity must be a whole number of 0 or more.";
  }
  if (!supplierId) errors.supplierId = "A supplier must be selected.";

  return errors;
}

// POST /api/products (multipart/form-data - multer puts the file on req.file)
exports.createProduct = async (req, res) => {
  const errors = validateProductInput(req.body);
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  try {
    const supplier = await Supplier.findByPk(req.body.supplierId);
    if (!supplier) {
      return res
        .status(400)
        .json({
          error: "Validation failed.",
          fields: { supplierId: "Supplier does not exist." },
        });
    }

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      stockQty: req.body.stockQty,
      lowStockThreshold:
        req.body.lowStockThreshold ||
        process.env.LOW_STOCK_THRESHOLD_DEFAULT ||
        5,
      expiryDate: req.body.expiryDate || null,
      supplierId: req.body.supplierId,
      imagePath: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create product." });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const errors = validateProductInput(req.body);
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const updates = {
      name: req.body.name,
      price: req.body.price,
      stockQty: req.body.stockQty,
      lowStockThreshold:
        req.body.lowStockThreshold || product.lowStockThreshold,
      expiryDate: req.body.expiryDate || null,
      supplierId: req.body.supplierId,
    };
    if (req.file) updates.imagePath = `/uploads/${req.file.filename}`;

    await product.update(updates);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update product." });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    await product.destroy();
    res.json({ message: "Product deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete product." });
  }
};
