const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile, writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

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
    const { ann_name, ann_desc, enn_startDate, ann_endDate } = req.body;
    // console.log(req.body);

    try {
      const events = readJSONFile(eventsFilePath);
      const newEvent = {
        id: uuidv4(),
        ann_name,
        ann_desc,
        enn_startDate,
        ann_endDate,
        new: true,
      };
      events.push(newEvent);
      writeJSONFile(eventsFilePath, events);
      res.status(201).json({ message: "Event created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
