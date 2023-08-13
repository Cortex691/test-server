const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");
const jwt = require("jsonwebtoken");
const privateKey = "wumpafruit69";

const validateTokenAndGetUser = (token) => {
  try {
    const id = jwt.verify(token, privateKey);

    return id;
  } catch (err) {
    console.log(err);
    return "token-error";
  }
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const komercijalistiSnapshot = await db
      .ref("komercijalisti")
      .orderByChild("username")
      .equalTo(username)
      .once("value");
    const komercijalistiData = komercijalistiSnapshot.val();

    if (!komercijalistiData) {
      return res.status(200).json({ error: "Invalid username" });
    }

    const komercijalisti = Object.values(komercijalistiData);
    const matchingKomercijalista = komercijalisti.find(
      (komercijalista) => komercijalista.password === password
    );

    if (!matchingKomercijalista) {
      return res.status(200).json({ error: "Invalid password" });
    }

    const token = jwt.sign(matchingKomercijalista.id, privateKey);

    res.status(200).json({ message: "login-success", token: token });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-data", async (req, res) => {
  const { token } = req.body;

  try {
    const id = validateTokenAndGetUser(token);
    if (!id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const komercijalistiSnapshot = await db
      .ref("komercijalisti")
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const komercijalistiData = komercijalistiSnapshot.val();

    if (!komercijalistiData) {
      return res.status(404).json({ error: "Komercijalista not found" });
    }

    // As we know there is only one komercijalista with this id, we can get the first one
    const komercijalista = Object.values(komercijalistiData)[0];

    // Omit the password for security
    const { password, ...komercijalistaWithoutPassword } = komercijalista;

    res.status(200).json(komercijalistaWithoutPassword);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-brands", async (req, res) => {
  try {
    const brandsSnapshot = await db.ref("brands").once("value");
    const brandsData = brandsSnapshot.val();

    if (!brandsData) {
      return res.status(404).json({ error: "No brands found" });
    }

    // Convert the object of objects to an array of objects
    const brandsArray = Object.values(brandsData);

    res.status(200).json(brandsArray);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-products", async (req, res) => {
  const { token, brand } = req.body;

  try {
    // Validate the token and get the komercijalista id
    const id = validateTokenAndGetUser(token);
    if (!id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Query the database to get the products for the specified brand
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

    // Convert the productsData object to an array of products
    const products = Object.values(productsData);

    res.status(200).json(products);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/get-artikal", async (req, res) => {
  const { token, id } = req.body;

  try {
    // Validate the token and get the komercijalista id
    const komercijalistaId = validateTokenAndGetUser(token);
    if (!komercijalistaId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the provided id matches any id inside komercijalisti
    const komercijalistiSnapshot = await db
      .ref("komercijalisti")
      .orderByChild("id")
      .equalTo(komercijalistaId)
      .once("value");
    const komercijalistiData = komercijalistiSnapshot.val();
    if (!komercijalistiData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productsSnapshot = await db
      .ref("products")
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const productData = productsSnapshot.val();

    console.log(productData);

    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Return the product
    const product = Object.values(productData)[0];
    res.status(200).json(product);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-order", async (req, res) => {
  const { order } = req.body;

  try {
    const ordersSnapshot = await db.ref("orders").once("value");
    const numberOfOrders = ordersSnapshot.numChildren();

    const orderId = uuidv4();

    const orderWithIdAndIndex = {
      ...order,
      id: orderId,
      index: numberOfOrders + 1,
    };

    await db.ref("orders").push(orderWithIdAndIndex);

    res.status(200).json({ message: "Order added successfully" });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ error: "Failed to add order" });
  }
});

router.post("/get-orders", async (req, res) => {
  const { token } = req.body;

  try {
    // Get the komercijalista id from the token
    const komercijalistaId = validateTokenAndGetUser(token);
    if (!komercijalistaId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ordersRef = db.ref("orders");
    const ordersSnapshot = await ordersRef.once("value");
    const ordersData = ordersSnapshot.val();

    // Filter orders based on komercijalistaId
    const filteredOrders = Object.values(ordersData || {}).filter(
      (order) => order.komercijalista?.id === komercijalistaId
    );

    res.status(200).json(filteredOrders);
  } catch (err) {
    console.error("Error getting orders:", err);
    res.status(500).json({ error: "Failed to get orders" });
  }
});

router.post("/get-komercijalista-by-id", async (req, res) => {
  const { id } = req.body;

  try {
    const komercijalistiSnapshot = await db
      .ref("komercijalisti")
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const komercijalistiData = komercijalistiSnapshot.val();

    if (!komercijalistiData) {
      return res.status(404).json({ error: "Komercijalista not found" });
    }

    const komercijalista = Object.values(komercijalistiData)[0];

    const { password, ...komercijalistaWithoutPassword } = komercijalista;

    return res.status(200).json(komercijalistaWithoutPassword);
  } catch (err) {
    console.error("Error getting komercijalista by id:", err);
    return res.status(500).json({ error: "Failed to get komercijalista" });
  }
});

router.post("/get-orders-by-id", async (req, res) => {
  const { id } = req.body;

  try {
    const ordersRef = db.ref("orders");
    const ordersSnapshot = await ordersRef.once("value");
    const ordersData = ordersSnapshot.val();

    // Filter orders based on komercijalistaId
    const filteredOrders = Object.values(ordersData || {}).filter(
      (order) => order.komercijalista?.id === id
    );

    res.status(200).json(filteredOrders);
  } catch (err) {
    console.error("Error getting orders:", err);
    res.status(500).json({ error: "Failed to get orders" });
  }
});

router.post("/get-objekat-by-id", async (req, res) => {
  const { id } = req.body;

  try {
    const objektiSnapshot = await db
      .ref("objekti")
      .orderByChild("id")
      .equalTo(id)
      .once("value");
    const objekatData = objektiSnapshot.val();

    if (!objekatData) {
      return res.status(404).json({ error: "Objekat not found" });
    }

    const objekat = Object.values(objekatData)[0];

    return res.status(200).json(objekat);
  } catch (err) {
    console.error("Error getting komercijalista by id:", err);
    return res.status(500).json({ error: "Failed to get komercijalista" });
  }
});

router.post("/get-orders-by-objekat", async (req, res) => {
  const { objekatName } = req.body;

  try {
    const ordersRef = db.ref("orders");
    const ordersSnapshot = await ordersRef
      .orderByChild("objekat")
      .equalTo(objekatName)
      .once("value");
    const ordersData = ordersSnapshot.val();

    const ordersArray = ordersData ? Object.values(ordersData) : [];

    return res.status(200).json(ordersArray);
  } catch (err) {
    console.error("Error getting orders by objekat:", err);
    return res.status(500).json({ error: "Failed to get orders" });
  }
});

module.exports = router;
