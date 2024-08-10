const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const { writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const employeesFilePath = path.join(__dirname, "../data/employees.json");

//
router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const employees = readJSONFile(employeesFilePath);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/search", authMiddleware, (req, res) => {
  const { fullname } = req.headers;
  // console.log(fullname);

  try {
    const employees = readJSONFile(employeesFilePath);
    const filteredEmployees = employees.filter((employee) =>
      employee.fullname.toLowerCase().includes(fullname.toLowerCase())
    );
    res.json(filteredEmployees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    } = req.body;
    // console.log(req.body);

    try {
      const employees = readJSONFile(employeesFilePath);
      const newEmployee = {
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
      };
      employees.push(newEmployee);
      writeJSONFile(employeesFilePath, employees);
      res.status(201).json({ message: "Employee created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/edit/:id",
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
    } = req.body;
    // console.log(req.params.id);
    console.log(req.body);

    try {
      const employees = readJSONFile(employeesFilePath);
      const employeeIndex = employees.findIndex(
        (tr) => tr.id === req.params.id
      );

      if (employeeIndex === -1)
        return res.status(404).json({ message: "Employee not found" });

      if (fullname) {
        employees[employeeIndex].fullname = fullname;
      }
      if (tel) {
        employees[employeeIndex].tel = tel;
      }
      if (d_birth) {
        employees[employeeIndex].d_birth = d_birth;
      }
      if (gender) {
        employees[employeeIndex].gender = gender;
      }
      if (nation) {
        employees[employeeIndex].nation = nation;
      }
      if (marriage) {
        employees[employeeIndex].marriage = marriage;
      }
      if (work_tel) {
        employees[employeeIndex].work_tel = work_tel;
      }
      if (address) {
        employees[employeeIndex].address = address;
      }
      if (city) {
        employees[employeeIndex].city = city;
      }
      if (country) {
        employees[employeeIndex].country = country;
      }
      if (email) {
        employees[employeeIndex].email = email;
      }
      if (job_title) {
        employees[employeeIndex].job_title = job_title;
      }
      if (department) {
        employees[employeeIndex].department = department;
      }
      if (emp_status) {
        employees[employeeIndex].emp_status = emp_status;
      }
      if (division) {
        employees[employeeIndex].division = division;
      }
      writeJSONFile(employeesFilePath, employees);
      res.json({ message: "Employee updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    try {
      const employees = readJSONFile(employeesFilePath);
      const filteredEmployee = employees.filter(
        (tr) => tr.id !== req.params.id
      );
      console.log(req.params.id);

      writeJSONFile(employeesFilePath, filteredEmployee);
      res.json({ message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
