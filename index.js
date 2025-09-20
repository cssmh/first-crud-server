const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongo code
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tkq3bal.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // main mongo database collection files names
    const allUserCollection = client.db("usersDB").collection("users");
    // main mongo database collection files names end

    // get all users from database
    app.get("/users", async (req, res) => {
      const cursor = allUserCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all users from database end

    // send user to database
    app.post("/users", async (req, res) => {
      const gotUser = req.body;
      console.log("new got user", gotUser);
      const result = await allUserCollection.insertOne(gotUser);
      res.send(result);
    });
    // send user to database end

    // update user info
    // first get that user for client
    app.get("/update/:id", async (req, res) => {
      const getThatUser = req.params.id;
      const query = { _id: new ObjectId(getThatUser) };
      const result = await allUserCollection.findOne(query);
      res.send(result);
    });

    // get updated info from client to server, time to database
    app.put("/update/:id", async (req, res) => {
      const getIdFromClient = req.params.id;
      const updatedUserInfo = req.body;
      console.log(updatedUserInfo, getIdFromClient);
      // time to send updated info to database
      const filter = { _id: new ObjectId(getIdFromClient) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          name: updatedUserInfo.name,
          email: updatedUserInfo.email,
        },
      };
      const result = await allUserCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
      // send updated info to database end
    });
    // update user info end

    app.delete("/users/:id", async (req, res) => {
      const getIdFromClient = req.params.id;
      console.log("please delete", getIdFromClient);
      const query = { _id: new ObjectId(getIdFromClient) };
      const result = await allUserCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// mongo code end

app.get("/", (req, res) => {
  res.send("CRUD RUNNING IN LOCAL 5000");
});

app.listen(port, () => {
  console.log(`CRUD running on port, ${port}`);
});
