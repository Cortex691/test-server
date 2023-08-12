const express = require("express");
const gostRouter = express.Router();
const { db } = require("../firebase-config");

router.get("/get-brands", async (req, res) => {
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

router.post("/get-products", async (req, res) => {
  const { brand } = req.body;

  try {
    const productsSnapshot = await db
      .ref("products")
      .orderByChild("brand")
      .equalTo(brand)
      .once("value");
    const productsData = productsSnapshot.val();

    if (!productsData) {
      return res
        .status(404)
        .json({ error: "Products not found for this brand" });
    }

    const products = Object.values(productsData);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-product", async (req, res) => {
  const { id } = req.body;

  try {
    const productSnapshot = await db
      .ref("products")
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const productData = productSnapshot.val();

    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = Object.values(productData)[0];

    return res.status(200).json(product);
  } catch (err) {
    console.error("Error getting product by id:", err);
    return res.status(500).json({ error: "Failed to get product" });
  }
});

module.exports = gostRouter;
