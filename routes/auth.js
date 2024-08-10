const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { readJSONFile, writeJSONFile } = require("../utils/fileUtils");

const router = express.Router();
const usersFilePath = path.join(__dirname, "../data/users.json");

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH, { expiresIn: "1d" });
};

// Регистрация
router.post("/register", (req, res) => {
  const {
    fullname,
    username,
    password,
    email,
    job_title,
    department,
    tel,
    role,
  } = req.body;

  try {
    const users = readJSONFile(usersFilePath);
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: uuidv4(),
      fullname,
      username,
      email,
      job_title,
      department,
      tel,
      password: hashedPassword,
      role,
    };
    users.push(newUser);
    writeJSONFile(usersFilePath, users);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Логин
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const users = readJSONFile(usersFilePath);
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken({
      username: user.username,
      role: user.role,
      id: user.id,
    });
    const refreshToken = generateRefreshToken({ username: user.username });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
