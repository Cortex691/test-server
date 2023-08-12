const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const gost = require("./api/gost");
const admin = require("./api/admin");

const app = express();

const allowedOrigins = [
  "https://dg-catalog.com",
  "https://admin.dg-catalog.com",
  "https://komercijalista.dg-catalog.com",
];

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/gost", gost);

app.use("/api/admin", admin);

app.listen(PORT, () => console.log("Server is running in port", PORT));
