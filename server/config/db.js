const { Sequelize } = require("sequelize");
const path = require("path");

// Sequelize will create inventory.sqlite automatically,
// and build tables from the models we define later.
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "inventory.sqlite"),
  logging: false, // flip to console.log if you want to see raw SQL while debugging
});

module.exports = sequelize;
