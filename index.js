const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// connect mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.prbxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    // add data base name
    const database = client.db("carSel");

    // add collection name
    const appointmentsCollection = database.collection("appointments");
    const servicesCollection = database.collection("services");
    const selectedCollection = database.collection("Selected");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");
    const userItemCollection = database.collection("userItem");
    const newaddedCollection = database.collection("newadded");

    // start

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      // console.log(result);
      res.json(result);
    });

    app.get("/review", async (req, res) => {
      const cursor = await reviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
      // console.log(result);
    });

    app.get("/services", async (req, res) => {
      const cursor = await servicesCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
      console.log("running");
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const details = await servicesCollection.findOne(query);
      res.json(details);
    });

    app.post("/selected/add", async (req, res) => {
      const selected = req.body;
      const result = await selectedCollection.insertOne(selected);
      res.json(result);
    });

    app.get("/selected", async (req, res) => {
      const uid = req.query.uid;
      const query = { uid: uid };

      const cursor = await selectedCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/allselected", async (req, res) => {
      const result = await selectedCollection.find({}).toArray();
      res.json(result);
      console.log(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };

      const result = await selectedCollection.deleteOne(query);
      res.json(result);
      // console.log(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };

      const result = await selectedCollection.deleteOne(query);
      res.json(result);
      // console.log(result);
    });

    app.post("/newadded", async (req, res) => {
      const review = req.body;
      const result = await newaddedCollection.insertOne(review);
      // console.log(result);
      res.json(result);
    });

    app.get("/newadded", async (req, res) => {
      const result = await newaddedCollection.find({}).toArray();
      res.json(result);
    });

    app.put("/confirmation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orders = {
        $set: {
          status: "Confirm",
        },
      };
      const result = await selectedCollection.updateOne(query, orders);
      res.json(result);
    });

    //find appointments
    app.get("/appointments", async (req, res) => {
      const email = req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
      console.log(date);

      const query = { email: email, date: date };
      console.log(query);
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // post appointments
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
      // console.log(result);
    });

    // updateUser
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // make Admin

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log("put", user);
      res.json(result);
    });

    console.log("database connected successfully");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
