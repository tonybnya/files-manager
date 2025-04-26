import { MongoClient } from "mongodb";

// class DBClient
class DBClient {
  // constructor to create client to MongoDB
  constructor() {
    // host: from the environment variable DB_HOST
    // default: localhost
    const HOST = process.env.DB_HOST || "localhost";

    // port: from the environment variable DB_PORT
    // default: 27017
    const PORT = process.env.DB_PORT || 27017;

    // database: from the environment variable DB_DATABASE
    // default: files_manager
    const DATABASE = process.env.DB_DATABASE || "files_manager";

    // set the MongoDB connection url
    const uri = `mongodb://${HOST}:${PORT}`;

    // init a client to MongoDB
    this.client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    // connect to MongoDB and set the database
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(DATABASE);
        console.log("MongoDB connection established");
      })
      .catch((err) => {
        console.error("Error while connecting to MongoDB:", err);
      });
  }

  // function to check the status of the connection to MongoDB
  isAlive() {
    try {
      this.client.db("admin").command({ ping: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  // asynchronous function nbUsers that returns
  // the number of documents in the collection users
  async nbUsers() {
    // get the collection users
    // count and return the number of documents
    return this.db.collection("users").countDocuments();
  }

  // asynchronous function nbFiles that returns
  // the number of documents in the collection files
  async nbFiles() {
    // get the collection files
    // count and return the number of files
    return this.db.collection("files").countDocuments();
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
