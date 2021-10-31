const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//Add Middlewares
app.use(cors());
app.use(express.json());

/* ------------------------------ Mongo Client ------------------------------ */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cyduv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    // console.log("db connected");

    //Create DB
    const database = client.db("kayak_tourism");
    const toursCollection = database.collection("tours");
    const orderCollection = database.collection("orders");

    // POST request to add new tours
    app.post("/tour", async (req, res) => {
      const result = await toursCollection.insertOne(req.body);

      res.json(result);
    });

    //GET request to show all tours
    app.get("/tours", async (req, res) => {
      const cursor = toursCollection.find({});
      const tours = await cursor.toArray();
      res.send(tours);
    });

    //GET request single tour info
    app.get("/tour/info/:id", async (req, res) => {
      const id = req.params.id;

      const tour = await toursCollection.findOne({ _id: ObjectId(id) });

      res.send(tour);
    });

    //POST request to add orders

    app.post("/orders", async (req, res) => {
      const result = await orderCollection.insertOne(req.body);

      res.json(result);
    });

    //GET request for getting personal booking information
    app.get("/bookings/:email", async (req, res) => {
      console.log(req.params.email);
      const cursor = orderCollection.find({
        email: { $regex: req.params?.email },
      }); //{}

      const result = await cursor.toArray();
      console.log(result);
      res.json(result);
    });

    //DELETE Request from users personal bookings

    app.delete("/tour/delete/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.json(result);
    });

    //GET request for all  user booking information
    app.get("/bookings/", async (req, res) => {
      console.log(req.params.email);
      const cursor = orderCollection.find({});

      const result = await cursor.toArray();
      //   console.log(result);
      res.json(result);
    });

    //Update request to handle Pending status

    app.put("/tour/update/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          status: req.body.status,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      //   const { id, name, description } = req.body;
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

//Node Server Running
app.get("/", (req, res) => res.send("Kayak-Tourism Server Running"));
app.listen(port, () => console.log(`Tour-booking listening on port ${port}!`));
