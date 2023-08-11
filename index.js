const express = require("express");
const gost = require("./api/gost");
const app = express();

const PORT = process.env.PORT || 5050;

app.use("/api/gost", gost);

app.listen(PORT, () => console.log("Server is running in port", PORT));
