const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 },
  },
  stockQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Product;
