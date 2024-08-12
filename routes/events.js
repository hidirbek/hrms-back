const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile, writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const eventsFilePath = path.join(__dirname, "../data/events.json");

// Получить всех пользователей
router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const events = readJSONFile(eventsFilePath);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const { name, description, start, end } = req.body;
    // console.log(req.body);

    try {
      const events = readJSONFile(eventsFilePath);
      const new_event = {
        id: uuidv4(),
        name,
        description,
        start,
        end,
        allDay: true,
        new: true,
      };

      console.log(new_event, "event");
      events.push(new_event);
      writeJSONFile(eventsFilePath, events);
      res.status(201).json({ message: "Event created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
