const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;
const DATA_FILE = "./username.json";

app.use(cors());
app.use(bodyParser.json());

//  SIGN-UP ROUTE
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  let users = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      users = JSON.parse(data);
    } catch (err) {
      return res.status(500).json({ message: "Corrupted user file" });
    }
  }

  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  res.json({ message: "User registered successfully" });
});

//  LOGIN ROUTE
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!fs.existsSync(DATA_FILE)) {
    return res.status(401).json({ message: "No users registered yet" });
  }

  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const users = JSON.parse(data);
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      res.json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Could not read user data" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
