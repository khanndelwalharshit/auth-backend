const { DataTypes } = require("sequelize");
const { sequelize } = require("../server"); // shared Sequelize instance from server.js

const User = sequelize.define("User", {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = User; // ✅ required to use in server.js
