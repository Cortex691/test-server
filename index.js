const express = require("express");
const gost = require("./api/gost");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5050;

app.use(cors());

app.use("/api/gost", gost);

app.listen(PORT, () => console.log("Server is running in port", PORT));
