const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//Middleware....
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@applicationuser1.8vmcaeg.mongodb.net/?appName=applicationUser1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("property_db");
    const propertiesServices = db.collection("properties");
    const ratingsCollection = db.collection("ratings");

    // Add a new property..
    app.post("/add-properties", async (req, res) => {
      const data = req.body;
      const updatedData = {
        ...data,
        postedDate: new Date().toISOString(),
      };

      const result = await propertiesServices.insertOne(updatedData);
      res.send(result);
    });

    // Get latest 6 properties
    app.get("/latest-properties", async (req, res) => {
      const result = await propertiesServices
        .find()
        .sort({ postedDate: "desc" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Get all properties
    app.get("/all-properties", async (req, res) => {
      const result = await propertiesServices.find().toArray();
      res.send(result);
    });

    // Get property by id
    app.get("/properties/:id", async (req, res) => {
      const { id } = req.params;
      const result = await propertiesServices.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // My properties by email
    app.get("/my-properties", async (req, res) => {
      const { email } = req.query;
      const result = await propertiesServices
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    // Update property by id
    app.put("/update-property/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updateProperty = {
        $set: {
          ...data,
        },
      };
      const result = await propertiesServices.updateOne(query, updateProperty);
      res.send(result);
    });

    // Delete property by id
    app.delete("/delete-property/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesServices.deleteOne(query);
      res.send(result);
    });

    // Add rating
    app.post("/add-ratings", async (req, res) => {
      const ratingData = req.body;
      const result = await ratingsCollection.insertOne(ratingData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
