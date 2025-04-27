/**
 *
 * MongoDB utils
 *
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// class DBClient
class DBClient {
  // constructor to create client to MongoDB
  constructor() {
    // host: from the environment variable DB_HOST
    // default: localhost
    const HOST = "localhost";

    // port: from the environment variable DB_PORT
    // default: 27017
    const PORT = 27017;

    // database: from the environment variable DB_DATABASE
    // default: files_manager
    const DATABASE = process.env.DB_DATABASE || "files_manager";

    // set the MongoDB connection url
    const URI = process.env.DB_URI || `mongodb://${HOST}:${PORT}`;

    // init a client to MongoDB
    this.client = new MongoClient(URI, {
      // useUnifiedTopology is no longer needed in MongoDB Node.js driver >= 4.0
      // useUnifiedTopology: true,
    });

    this.db = null;
    // track connection status
    this.connected = false;

    // connect to MongoDB and set the database
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(DATABASE);
        this.connected = true;
        console.log("MongoDB connection established");
      })
      .catch((err) => {
        console.error("Error while connecting to MongoDB:", err);
      });
  }

  // function to check the status of the connection to MongoDB
  isAlive() {
    // try {
    //   this.client.db("admin").command({ ping: 1 });
    //   return true;
    // } catch (error) {
    //   return false;
    // }
    return this.connected;
  }

  // asynchronous function nbUsers that returns
  // the number of documents in the collection users
  async nbUsers() {
    // get the collection users
    // count and return the number of documents
    if (!this.db) return 0;
    return this.db.collection("users").countDocuments();
  }

  // asynchronous function nbFiles that returns
  // the number of documents in the collection files
  async nbFiles() {
    // get the collection files
    // count and return the number of files
    if (!this.db) return 0;
    return this.db.collection("files").countDocuments();
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
