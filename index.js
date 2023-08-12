const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const gostRouter = require("./api/gost");
const adminRouter = require("./api/admin");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/gost", gostRouter);

app.use("/api/admin", adminRouter);

app.listen(PORT, () => console.log("Server is running in port", PORT));
