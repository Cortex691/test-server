const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const gost = require("./api/gost");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/gost", gost);

app.listen(PORT, () => console.log("Server is running in port", PORT));
