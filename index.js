const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const gost = require("./api/gost");
const admin = require("./api/admin");
const komercijalista = require("./api/komercijalista");

const app = express();

const allowedOrigins = [
  "https://dg-catalog.com",
  "https://admin.dg-catalog.com",
  "https://komercijalista.dg-catalog.com",
];

const PORT = process.env.PORT || 5050;

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/gost", gost);

app.use("/api/admin", admin);

app.use("/api/komercijalista", komercijalista);

app.listen(PORT, () => console.log("Server is running in port", PORT));
