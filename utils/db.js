import { MongoClient } from "mongodb";

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
const url = `mongodb://${HOST}:${PORT}`;

// class DBClient
class DBClient {
  // constructor to create client to MongoDB
  constructor() {
    // init a client to MongoDB
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    // connect to MongoDB and set the database
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(`${DATABASE}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
