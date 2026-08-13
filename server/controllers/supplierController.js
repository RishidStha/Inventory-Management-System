const { Supplier, Product } = require("../models");

// GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: Product, attributes: ["id"] }], // used to count products supplied
    });

    const result = suppliers.map((s) => {
      const plain = s.toJSON();
      return { ...plain, productsSuppliedCount: plain.Products?.length || 0 };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch suppliers." });
  }
};

// GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier)
      return res.status(404).json({ error: "Supplier not found." });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch supplier." });
  }
};

// POST /api/suppliers
exports.createSupplier = async (req, res) => {
  const { name, mobile, vatNo, address } = req.body;
  const errors = {};

  if (!name || !name.trim()) errors.name = "Supplier name is required.";
  if (!mobile || !/^\d{7,15}$/.test(mobile)) {
    errors.mobile = "Mobile number must be 7-15 digits.";
  }

  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  try {
    const supplier = await Supplier.create({ name, mobile, vatNo, address });
    res.status(201).json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create supplier." });
  }
};

// PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  const { name, mobile, vatNo, address } = req.body;
  const errors = {};

  if (name !== undefined && !name.trim())
    errors.name = "Supplier name cannot be empty.";
  if (mobile !== undefined && !/^\d{7,15}$/.test(mobile)) {
    errors.mobile = "Mobile number must be 7-15 digits.";
  }
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier)
      return res.status(404).json({ error: "Supplier not found." });

    await supplier.update({ name, mobile, vatNo, address });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update supplier." });
  }
};

// DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier)
      return res.status(404).json({ error: "Supplier not found." });

    const productCount = await Product.count({
      where: { supplierId: supplier.id },
    });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${productCount} product(s) still reference this supplier.`,
      });
    }

    await supplier.destroy();
    res.json({ message: "Supplier deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete supplier." });
  }
};
