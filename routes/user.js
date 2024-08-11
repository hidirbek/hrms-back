const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile, writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const bcrypt = require("bcryptjs");
const router = express.Router();
const usersFilePath = path.join(__dirname, "../data/users.json");
const { v4: uuidv4 } = require("uuid");

// Получить всех пользователей
router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const users = readJSONFile(usersFilePath);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get user info
router.get("/get_user/:id", authMiddleware, (req, res) => {
  try {
    const users = readJSONFile(usersFilePath);
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", authMiddleware, (req, res) => {
  const { fullname } = req.headers;
  // console.log(fullname);

  try {
    const users = readJSONFile(usersFilePath);
    const filteredUsers = users.filter((user) =>
      user.fullname.toLowerCase().includes(fullname.toLowerCase())
    );
    res.json(filteredUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создание пользователя (доступно только для admin и HR)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const {
      fullname,
      tel,
      d_birth,
      gender,
      nation,
      marriage,
      work_tel,
      address,
      city,
      country,
      email,
      job_title,
      department,
      emp_status,
      division,
      username,
      password,
      role,
    } = req.body;

    try {
      const users = readJSONFile(usersFilePath);
      let foundedUser = users.find((user) => user.username === username);

      if (foundedUser) {
        return res.status(200).send({
          msg: "Username already exist!",
        });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        id: uuidv4(),
        fullname,
        tel,
        d_birth,
        gender,
        nation,
        marriage,
        work_tel,
        address,
        city,
        country,
        email,
        job_title,
        department,
        emp_status,
        division,
        username,
        password: hashedPassword,
        role,
        online: false,
        feel_status: "No Status Set",
        pr_status: "No Status Set",
        join_date: new Date().toISOString,
      };

      users.push(newUser);
      writeJSONFile(usersFilePath, users);
      res.status(201).json({ message: "User created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Обновление пользователя (доступно только для admin и HR)
router.put(
  "/edit/:id",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    console.log(req.body);

    const {
      fullname,
      tel,
      d_birth,
      gender,
      nation,
      marriage,
      work_tel,
      address,
      city,
      country,
      email,
      job_title,
      department,
      emp_status,
      division,
      username,
      password,
      role,
    } = req.body;

    try {
      const users = readJSONFile(usersFilePath);
      const userIndex = users.findIndex((u) => u.id === req.params.id);
      if (userIndex === -1)
        return res.status(404).json({ message: "User not found" });

      if (password) {
        users[userIndex].password = bcrypt.hashSync(password, 10);
      }
      if (role) {
        users[userIndex].role = role;
      }
      if (username) {
        users[userIndex].username = username;
      }
      if (fullname) {
        users[userIndex].fullname = fullname;
      }
      if (email) {
        users[userIndex].email = email;
      }
      if (job_title) {
        users[userIndex].job_title = job_title;
      }
      if (department) {
        users[userIndex].department = department;
      }
      if (tel) {
        users[userIndex].tel = tel;
      }
      if (d_birth) {
        users[userIndex].d_birth = d_birth;
      }
      if (gender) {
        users[userIndex].gender = gender;
      }
      if (nation) {
        users[userIndex].nation = nation;
      }
      if (marriage) {
        users[userIndex].marriage = marriage;
      }
      if (work_tel) {
        users[userIndex].work_tel = work_tel;
      }
      if (address) {
        users[userIndex].address = address;
      }
      if (city) {
        users[userIndex].city = city;
      }
      if (country) {
        users[userIndex].country = country;
      }
      if (emp_status) {
        users[userIndex].emp_status = emp_status;
      }
      if (division) {
        users[userIndex].division = division;
      }
      writeJSONFile(usersFilePath, users);
      res.json({ message: "User updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Удаление пользователя (доступно только для admin и HR)
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    try {
      const users = readJSONFile(usersFilePath);

      // console.log(req.params.id);

      const filteredUsers = users.filter((u) => u.id !== req.params.id);
      writeJSONFile(usersFilePath, filteredUsers);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
