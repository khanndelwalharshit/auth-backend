const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = "./username.json";

app.use(cors());
app.use(bodyParser.json());

// SIGNUP
app.post("/signup", (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  let users = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      users = JSON.parse(data);
    } catch {
      return res.status(500).json({ message: "Corrupted user file" });
    }
  }

  const phoneExists = users.some((u) => u.phone === phone);
  if (phoneExists) {
    return res.status(400).json({ message: "Phone number already registered" });
  }

  users.push({ firstName, lastName, phone, email, password });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  res.json({ message: "User registered successfully" });
});

// LOGIN
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
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid phone or password" });
    }
  } catch {
    res.status(500).json({ message: "Could not read user data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
