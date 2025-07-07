const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = "./username.json";
const SECRET_KEY = "your_secret_key"; // Ideally store in .env

app.use(cors());
app.use(bodyParser.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// SIGNUP
app.post("/signup", (req, res) => {
  const { firstName, lastName, phone, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  let users = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      users = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ message: "Corrupted user file" });
    }
  }

  const userExists = users.some((u) => u.phone === phone);
  if (userExists) {
    return res.status(400).json({ message: "Phone number already registered" });
  }

  users.push({ firstName, lastName, phone, email, password });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  res.json({ message: "User registered successfully" });
});

// LOGIN (with JWT)
app.post("/login", (req, res) => {
  const { phone, password } = req.body;

  if (!fs.existsSync(DATA_FILE)) {
    return res.status(401).json({ message: "No users registered yet" });
  }

  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.phone === phone && u.password === password);

    if (user) {
      const token = jwt.sign({ phone: user.phone, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Could not read user data" });
  }
});

// Example protected route
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the protected dashboard", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
