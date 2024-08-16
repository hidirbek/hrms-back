const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { readJSONFile, writeJSONFile } = require("../utils/fileUtils");
const nodemailer = require("nodemailer");

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

// -------------------------------------
// ---------------------------------------

router.post("/send-reset-code", async (req, res) => {
  const { email } = req.body;
  // console.log(email);
  const users = readJSONFile(usersFilePath);

  const userIndex = users.findIndex((u) => u.email === email);
  // const user = users.find((u) => u.email === email);
  // console.log(users[userIndex]);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "khidirbek049@gmail.com",
      pass: "phtfgtydsvfgwjwr",
    },
  });
  const resetCode = Math.floor(Math.random() * 1000000);

  var mailOptions = {
    from: "khidirbek049@gmail.com",
    to: `${email}`,
    subject: "Password reset code",
    html: `Your password reset code is <b>${resetCode}</b>`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    users[userIndex].resetCode = resetCode;
    // console.log(resetCode);

    writeJSONFile(usersFilePath, users);

    res.send({
      msg: "Success! Email sent.",
    });
  } catch (error) {
    console.log("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

// router.post("/send-reset-code", (req, res) => {
//   const { email } = req.body;
//   console.log(email);
//   var transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "khidirbek049@gmail.com",
//       pass: "phtfgtydsvfgwjwr",
//     },
//   });

//   var mailOptions = {
//     from: "khidirbek049@gmail.com",
//     to: `${email}`,
//     subject: "ascjndjfhvn cdkjf",
//     html: `<i>Salom</i>`,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Email sent: " + info.response);
//     }
//   });
//   res.send({
//     msg: "Success!",
//   });
// });

router.post("/verify-reset-code", (req, res) => {
  const { email, code } = req.body;
  const users = readJSONFile(usersFilePath);

  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  // console.log(users[userIndex].resetCode != code);

  if (users[userIndex].resetCode != code) {
    return res.status(400).json({ message: "Invalid reset code" });
  }

  res.json({ message: "Code verified" });
});

router.post("/reset-password", (req, res) => {
  const { email, password } = req.body;
  const users = readJSONFile(usersFilePath);
  const userIndex = users.findIndex((u) => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userIndex].password = bcrypt.hashSync(password, 10);
  // console.log(bcrypt.hashSync(password, 10));

  delete users[userIndex].resetCode; // Remove the reset code after password reset
  writeJSONFile(usersFilePath, users);

  res.json({ message: "Password reset successful" });
});

// -------------------------------

module.exports = router;
