const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();
const companyStrucFilePath = path.join(
  __dirname,
  "../data/companyStructure.json"
);

router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const company = readJSONFile(companyStrucFilePath);
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
