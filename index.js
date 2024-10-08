const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const path = require("path");
const { readJSONFile, writeJSONFile } = require("./utils/fileUtils");
const nodemailer = require("nodemailer");
const usersFilePath = path.join(__dirname, "./data/users.json");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/auth", require("./routes/auth"));
app.use("/v1/users", require("./routes/user"));
app.use("/v1/company", require("./routes/companyStructure"));
app.use("/v1/trainings", require("./routes/training"));
app.use("/v1/employees", require("./routes/employee"));
app.use("/v1/events", require("./routes/events"));
app.use("/v1", require("./routes/notifications"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
