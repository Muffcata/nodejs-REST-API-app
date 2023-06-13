const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const mongoose = require("mongoose");
require("dotenv").config();

const uriDB = process.env.DB_HOST || 3000;
const connection = mongoose.connect(uriDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
connection
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) =>
    console.log(`Server not running. Error message: ${err.message}`)
  );

const contactsRouter = require("./routes/api/contactsRoutes");
const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouter);
app.use((_, res, __) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Use api on routes: /api/contacts",
    data: "Not found",
  });
});

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: "fail",
    code: 500,
    message: err.message,
    data: "Internal Server Error",
  });
});

module.exports = app;
