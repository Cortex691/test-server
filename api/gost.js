const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");

router.get("/", async (req, res) => {
  try {
    const brandsSnapshot = await db.ref("brands").once("value");
    const brandsData = brandsSnapshot.val();

    const brandsArray = Object.values(brandsData || {});

    res.status(200).json(brandsArray);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

module.exports = router;
