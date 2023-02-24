const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db.js");

//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//Route files
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const { Promise } = require("mongoose");

const app = express();

//add body parser
app.use(express.json());

//Mount routers
app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);

app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, " mode on port", PORT)
);

//handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
});
