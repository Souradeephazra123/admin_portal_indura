const { Sequelize } = require("sequelize");

// Replace the placeholders with your actual database configuration
const sequelize = new Sequelize("admin_portal_indura", "root", "password", {
  host: "localhost", // Replace with your host (e.g., localhost or a remote IP)
  dialect: "mysql", // Use your database dialect (mysql, postgres, sqlite, etc.)
  logging: false, // Set to true for detailed query logs
});

// Test the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectDB();

module.exports = { sequelize };
