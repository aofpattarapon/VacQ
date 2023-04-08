const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const hospitals = require("./routes/hospitals");
const appointments = require("./routes/appointments");
const auth = require("./routes/auth");

dotenv.config({ path: "./config/config.env" });

connectDb();

const app = express();
app.use(cors());

const version = "/v1";
const baseUrl = "/api" + version;

const limiter = rateLimit({
  windowsMs: 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());
 
//Sanitize data
app.use(mongoSanitize());
app.use(hpp());
app.use(helmet());
app.use(xss());
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(`${baseUrl}/hospitals`, hospitals);
app.use(`${baseUrl}/appointments`, appointments);
app.use(`${baseUrl}/auth`, auth);

const PORT = process.env.PORT ?? 5000;

const server = app.listen(PORT, console.log("Server running in ", process.env.NODE_ENV, " node on port", PORT));

process.on("unhandledRejection", (err, promise) => {
  console.log("Error: " + err.message);
  server.close(() => express.exit(1));
});
