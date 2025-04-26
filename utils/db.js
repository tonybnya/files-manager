import { MongoClient } from "mongodb";

// class DBClient
class DBClient {
  // constructor to create client to MongoDB
  constructor() {
    // init a client to MongoDB
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
