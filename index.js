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
