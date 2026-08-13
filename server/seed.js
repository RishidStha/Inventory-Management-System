require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("./models");

async function seed() {
  await sequelize.sync();

  const email = "admin@stockgate.com";
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({ name: "Store Owner", email, passwordHash });

  console.log(
    "Admin user created! Email: admin@stockgate.com | Password: admin123",
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
