const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");

router.get("/", async (req, res) => {});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const adminSnapshot = await db
      .ref("admin")
      .orderByChild("username")
      .equalTo(username)
      .once("value");
    const adminData = adminSnapshot.val();

    if (!adminData) {
      return res.status(200).json({ error: "Invalid username" });
    }

    const adminKey = Object.keys(adminData)[0];
    const admin = adminData[adminKey];

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(200).json({ error: "Invalid password" });
    }

    const token = jwt.sign(admin.id, privateKey);

    res.status(200).json({ message: "login-success", token: token });
  } catch (err) {}
});

router.post("/add-brad", async (req, res) => {
  const { brand } = req.body;

  try {
    const brandToAdd = {
      ime: brand.ime,
      id: uuidv4(),
      url: brand.url,
      identifier: brand.identifier,
    };

    await db.ref("brands").push(brandToAdd);
    return res.json("Brand added successfully");
  } catch (error) {
    console.error("Error adding brand:", error);
    return res.status(500).json("Failed to add brand");
  }
});

router.get("/get-brands", async (req, res) => {
  try {
    const brandsSnapshot = await db.ref("brands").once("value");
    const brands = brandsSnapshot.val();

    const brandsArray = Object.keys(brands).map((key) => ({
      id: key,
      ...brands[key],
    }));

    return res.json(brandsArray);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json("Failed to fetch brands");
  }
});

router.post("/add-product", async (req, res) => {
  const { url, identifier, product } = req.body;

  try {
    const { sifra } = product;

    const productsSnapshot = await db
      .ref("products")
      .orderByChild("sifra")
      .equalTo(sifra)
      .once("value");
    const existingProduct = productsSnapshot.val();

    if (existingProduct) {
      return res.status(400).json("Proizvod sa istom šifrom već postoji.");
    }

    const productToAdd = {
      id: uuidv4(),
      ime: product.ime,
      brand: product.brand,
      sifra: sifra,
      cijena: product.cijena,
      opis: product.opis,
      dostupnost: product.dostupnost,
      slika: {
        url: url,
        identifier: identifier,
      },
    };

    await db.ref("products").push(productToAdd);

    return res.json({ message: "Proizvod uspešno dodat.", data: productToAdd });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json("Greška prilikom dodavanja proizvoda.");
  }
});

router.get("/get-products", async (req, res) => {
  try {
    const productsSnapshot = await db.ref("products").once("value");
    const products = productsSnapshot.val();

    const productsArray = Object.keys(products).map((key) => ({
      id: key,
      ...products[key],
    }));

    return res.json(productsArray);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json("Failed to fetch products");
  }
});

router.post("/delete-image", async (req, res) => {
  const { identifier, folder } = req.body;

  try {
    const medspaPicturesRef = storage()
      .bucket()
      .file(`${folder}/${identifier}`);

    await medspaPicturesRef.delete();

    res.status(200).json({ message: "Picture deleted successfully" });
  } catch (error) {
    console.error("Error deleting medspa picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update-product", async (req, res) => {
  const { editedProduct } = req.body;

  try {
    const productRef = db.ref("products");

    const query = productRef.orderByChild("id").equalTo(editedProduct.id);

    const snapshot = await query.once("value");
    const productData = snapshot.val();

    const productDataId = Object.keys(productData)[0];

    await productRef.child(productDataId).update({
      ime: editedProduct.ime,
      opis: editedProduct.opis,
      slika: {
        url: editedProduct.slika.url,
        identifier: editedProduct.slika.identifier,
      },
      cijena: editedProduct.cijena,
      dostupnost: editedProduct.dostupnost,
      id: editedProduct.id,
      sifra: editedProduct.sifra,
      brand: editedProduct.brand,
    });

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.post("/delete-product", async (req, res) => {
  const { productId } = req.body;

  try {
    const productsRef = db.ref("products");

    const snapshot = await productsRef
      .orderByChild("id")
      .equalTo(productId)
      .once("value");
    const productToDelete = snapshot.val();

    if (productToDelete) {
      const productKey = Object.keys(productToDelete)[0];

      await productsRef.child(productKey).remove();

      res.json("Product deleted successfully");
    } else {
      res.status(404).json("Product not found");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json("Failed to delete product");
  }
});

router.post("/add-komercijalista", async (req, res) => {
  const { ime, prezime, username, password } = req.body;

  try {
    const id = uuidv4();

    const komercijalistaToAdd = {
      id: id,
      ime: ime,
      prezime: prezime,
      username: username,
      password: password,
    };

    await db.ref("komercijalisti").push(komercijalistaToAdd);

    res.json("Komercijalista added successfully");
  } catch (error) {
    console.error("Error adding komercijalista:", error);
    res.status(500).json("Failed to add komercijalista");
  }
});

router.get("/get-komercijalista", async (req, res) => {
  try {
    const komercijalistiSnapshot = await db.ref("komercijalisti").once("value");
    const komercijalisti = komercijalistiSnapshot.val();

    const komercijalistiArray = Object.keys(komercijalisti).map((key) => ({
      id: key,
      ...komercijalisti[key],
    }));

    return res.json(komercijalistiArray);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json("Failed to fetch products");
  }
});

router.port("/edit-komercijalista", async (req, res) => {
  const { editedKomercijalista } = req.body;

  try {
    const komercijalistaRef = db.ref("komercijalisti");
    const query = komercijalistaRef
      .orderByChild("id")
      .equalTo(editedKomercijalista.id);
    const snapshot = await query.once("value");
    const komercijalistaData = snapshot.val();
    const komercijalistaDataId = Object.keys(komercijalistaData)[0];
    await komercijalistaRef.child(komercijalistaDataId).update({
      ime: editedKomercijalista.ime,
      prezime: editedKomercijalista.prezime,
      username: editedKomercijalista.username,
      password: editedKomercijalista.password,
      id: editedKomercijalista.id,
    });
    res.json({ message: "Komercijalista updated successfully" });
  } catch (error) {
    console.error("Error updating komercijalistu:", error);
    res.status(500).json({ error: "Failed to update komercijalistu" });
  }
});

router.post("/delete-komercijalista", async (req, res) => {
  const { komercijalistaId } = req.body;

  try {
    const komercijalistaRef = db.ref("komercijalisti");

    const snapshot = await komercijalistaRef
      .orderByChild("id")
      .equalTo(komercijalistaId)
      .once("value");
    const komercijalistaToDelete = snapshot.val();

    if (komercijalistaToDelete) {
      const komercijalistaKey = Object.keys(komercijalistaToDelete)[0];

      await komercijalistaRef.child(komercijalistaKey).remove();

      res.json("Komercijalista deleted successfully");
    } else {
      res.status(404).json("Komercijalista not found");
    }
  } catch (error) {
    console.error("Error deleting Komercijalista:", error);
    res.status(500).json("Failed to delete Komercijalista");
  }
});

router.post("/add-objekat", async (req, res) => {
  const { objekat } = req.body;

  try {
    const id = uuidv4();

    const objekatToAdd = {
      id: id,
      ime: objekat,
    };

    await db.ref("objekti").push(objekatToAdd);

    res.json("Objekat added successfully");
  } catch (error) {
    console.error("Error adding objekat:", error);
    res.status(500).json("Failed to add objekat.");
  }
});

router.get("/get-objekti", async (req, res) => {
  try {
    const objektiSnapshot = await db.ref("objekti").once("value");
    const objekti = objektiSnapshot.val();

    const objektiArray = Object.keys(objekti).map((key) => ({
      id: key,
      ...objekti[key],
    }));

    return res.json(objektiArray);
  } catch (error) {
    console.error("Error fetching objekti:", error);
    return res.status(500).json("Failed to fetch objekti");
  }
});

router.post("/edit-objekat", async (req, res) => {
  const { editedObjekat } = req.body;

  try {
    const objekatRef = db.ref("objekti");
    const query = objekatRef.orderByChild("id").equalTo(editedObjekat.id);
    const snapshot = await query.once("value");
    const objekatData = snapshot.val();
    const objekatDataId = Object.keys(objekatData)[0];
    await objekatRef.child(objekatDataId).update({
      ime: editedObjekat.ime,
      id: editedObjekat.id,
    });
    res.json({ message: "Objekat updated successfully" });
  } catch (error) {
    console.error("Error updating objekat:", error);
    res.status(500).json({ error: "Failed to update objekat" });
  }
});

router.post("/delete-objekat", async (req, res) => {
  const { objekatId } = req.body;

  try {
    const objekatRef = db.ref("objekti");

    const snapshot = await objekatRef
      .orderByChild("id")
      .equalTo(objekatId)
      .once("value");
    const objekatToDelete = snapshot.val();

    if (objekatToDelete) {
      const objekatKey = Object.keys(objekatToDelete)[0];

      await objekatRef.child(objekatKey).remove();

      res.json("Objeakat deleted successfully");
    } else {
      res.status(404).json("Objeakat not found");
    }
  } catch (error) {
    console.error("Error deleting Objeakat:", error);
    res.status(500).json("Failed to delete Objeakat");
  }
});

router.get("/get-orders", async (req, res) => {
  try {
    const ordersSnapshot = await db.ref("orders").once("value");
    const ordersData = ordersSnapshot.val();

    const ordersArray = Object.values(ordersData || {});

    res.status(200).json(ordersArray);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/change-order-activity", async (req, res) => {
  const { orderId } = req.body;

  try {
    const ordersRef = db.ref("orders");
    const orderSnapshot = await ordersRef
      .orderByChild("id")
      .equalTo(orderId)
      .once("value");
    const ordersData = orderSnapshot.val();

    if (!ordersData) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderKey = Object.keys(ordersData)[0];
    const order = ordersData[orderKey];

    const updatedOrder = { ...order, aktivnost: !order.aktivnost };
    await ordersRef.child(orderKey).update(updatedOrder);

    return res
      .status(200)
      .json({ message: "Order activity changed successfully" });
  } catch (err) {
    console.error("Error changing order activity:", err);
    return res.status(500).json({ error: "Failed to change order activity" });
  }
});

module.exports = router;
