const sequelize = require("../config/db");
const User = require("./User");
const Supplier = require("./Supplier");
const Product = require("./Product");

// A Product belongs to a Supplier; a Supplier has many Products.
Supplier.hasMany(Product, { foreignKey: "supplierId", onDelete: "RESTRICT" });
Product.belongsTo(Supplier, { foreignKey: "supplierId" });

module.exports = { sequelize, User, Supplier, Product };
