const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const { writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const trainingsFilePath = path.join(__dirname, "../data/trainings.json");

//
router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const trainings = readJSONFile(trainingsFilePath);
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/search", authMiddleware, (req, res) => {
  const { tr_title } = req.headers;
  // console.log(tr_title);

  try {
    const trainings = readJSONFile(trainingsFilePath);
    const filteredTrainings = trainings.filter((train) =>
      train.tr_title.toLowerCase().includes(tr_title.toLowerCase())
    );
    res.json(filteredTrainings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const { tr_title, department, division, floor, time } = req.body;
    // console.log(req.body);

    try {
      const trainings = readJSONFile(trainingsFilePath);
      const newTraining = {
        id: uuidv4(),
        tr_title,
        department,
        division,
        floor,
        time,
      };
      trainings.push(newTraining);
      writeJSONFile(trainingsFilePath, trainings);
      res.status(201).json({ message: "Training created" });
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
    const { tr_title, department, division, floor, time } = req.body;
    // console.log(req.params.id);
    console.log(req.body);

    try {
      const trainings = readJSONFile(trainingsFilePath);
      const trainingIndex = trainings.findIndex(
        (tr) => tr.id === req.params.id
      );
      // console.log(trainings[trainingIndex]);

      if (trainingIndex === -1)
        return res.status(404).json({ message: "Training not found" });

      if (tr_title) {
        trainings[trainingIndex].tr_title = tr_title;
      }
      if (division) {
        trainings[trainingIndex].division = division;
      }
      if (floor) {
        trainings[trainingIndex].floor = floor;
      }
      if (time) {
        trainings[trainingIndex].time = time;
      }
      if (department) {
        trainings[trainingIndex].department = department;
      }
      writeJSONFile(trainingsFilePath, trainings);
      res.json({ message: "Training updated" });
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
      const trainings = readJSONFile(trainingsFilePath);
      const filteredTraining = trainings.filter(
        (tr) => tr.id !== req.params.id
      );
      console.log(req.params.id);

      writeJSONFile(trainingsFilePath, filteredTraining);
      res.json({ message: "Training deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
