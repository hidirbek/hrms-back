const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const { writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");

const cron = require("node-cron");
const moment = require("moment");

const router = express.Router();
const employeesFilePath = path.join(__dirname, "../data/employees.json");

function checkForUpcomingBirthdays() {
  const employees = readJSONFile(employeesFilePath);
  const upcomingBirthdays = [];

  employees.forEach((employee) => {
    const today = moment().startOf("day");
    const birthday = moment(employee.d_birth, "YYYY-MM-DD")
      .year(today.year())
      .startOf("day");

    // Set the year of the birthday to the current year
    birthday.year(today.year());

    // If the birthday is earlier in the year, adjust to next year
    if (birthday.isBefore(today, "day")) {
      birthday.add(1, "year");
    }

    const diffDays = birthday.diff(today, "days");
    // console.log(birthday);
    // console.log(today);

    // console.log(diffDays);

    if (diffDays == 0) {
      upcomingBirthdays.push({
        name: employee.fullname,
        birhday: employee.d_birth,
      });
    }
  });

  return upcomingBirthdays;
}

// Schedule the task to run every day at 00:00
cron.schedule("0 0 * * *", () => {
  const upcomingBirthdays = checkForUpcomingBirthdays();

  if (upcomingBirthdays.length > 0) {
    console.log("Upcoming Birthdays:", upcomingBirthdays);
    //
  }
});

router.get("/notifications", authMiddleware, (req, res) => {
  const upcomingBirthdays = checkForUpcomingBirthdays();

  if (upcomingBirthdays.length > 0) {
    res.json(upcomingBirthdays);
  } else {
    res.json({ message: "No upcoming birthdays" });
  }
});

module.exports = router;
