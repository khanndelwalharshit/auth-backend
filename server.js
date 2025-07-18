require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");

// ✅ Create Sequelize instance and export it
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
module.exports.sequelize = sequelize;

// ✅ Import User model (which uses shared sequelize instance)
const User = require("./models/user");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ DB connected successfully");
    return sequelize.sync(); // Sync models
  })
  .then(() => {
    console.log("✅ Models synced");
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });

// ✅ Sign-up API
app.post("/signup", async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { phone } });

    if (existingUser) {
      return res.status(409).json({ error: "Phone number already registered" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ message: "User created", token });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ Login API
app.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ where: { phone } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
