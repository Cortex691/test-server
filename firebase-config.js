const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dg-group-catalog-default-rtdb.firebaseio.com",
  storageBucket: "dg-group-catalog.appspot.com",
});

const db = admin.database();
const storage = admin.storage();
const bucket = storage.bucket();

module.exports = { admin, db, bucket };
