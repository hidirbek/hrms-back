const fs = require("fs");
const path = require("path");

const readJSONFile = (filePath) => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
};

const writeJSONFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

module.exports = { readJSONFile, writeJSONFile };
