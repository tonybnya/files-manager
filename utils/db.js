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
    const HOST = process.env.DB_HOST || "localhost";

    // port: from the environment variable DB_PORT
    // default: 27017
    const PORT = process.env.DB_PORT || 27017;

    // database: from the environment variable DB_DATABASE
    // default: files_manager
    const DATABASE = process.env.DB_DATABASE || "files_manager";

    // set the MongoDB connection url
    const URI = process.env.DB_URI || `mongodb://${HOST}:${PORT}`;

    // Connection configuration
    this.uri = URI;
    this.dbName = DATABASE;
    this.maxRetries = 5;
    this.retryDelay = 1000; // Start with 1 second delay
    
    // Connection state tracking
    this.client = null;
    this.db = null;
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
    this.connectionAttempts = 0;
    this.lastError = null;
    this.lastConnectionTime = null;
    
    // Initialize client and connect
    this.client = new MongoClient(URI, {
      // Add any connection options if needed
    });
    
    // Start connection process
    this.connect();
  }
  
  // Method to connect to MongoDB with retry logic
  async connect() {
    if (this.connected || this.connecting) {
      return this.connectionPromise;
    }
    
    this.connecting = true;
    this.connectionAttempts += 1;
    
    // Create a promise that will be resolved when connection is successful
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        console.log(`Attempting to connect to MongoDB (attempt ${this.connectionAttempts})...`);
        
        // Connect to MongoDB
        await this.client.connect();
        
        // Set the database
        this.db = this.client.db(this.dbName);
        this.connected = true;
        this.connecting = false;
        this.lastConnectionTime = new Date();
        
        console.log(`MongoDB connection established successfully to database: ${this.dbName}`);
        resolve(this.db);
      } catch (err) {
        this.lastError = err;
        this.connecting = false;
        
        // Log detailed error information
        console.error(`MongoDB connection error (attempt ${this.connectionAttempts}):`, {
          uri: this.uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://****:****@'), // Hide credentials in logs
          database: this.dbName,
          error: err.message,
          stack: err.stack,
          code: err.code,
        });
        
        // Retry logic with exponential backoff
        if (this.connectionAttempts < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
          console.log(`Retrying connection in ${delay}ms...`);
          
          setTimeout(() => {
            this.connect().then(resolve).catch(reject);
          }, delay);
        } else {
          console.error(`Failed to connect to MongoDB after ${this.maxRetries} attempts. Giving up.`);
          reject(err);
        }
      }
    });
    
    return this.connectionPromise;
  }

  // Function to check the status of the connection to MongoDB
  async isAlive() {
    if (!this.connected || !this.db) {
      return false;
    }
    
    try {
      // Actually ping the database to ensure the connection is still active
      await this.db.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error("MongoDB connection check failed:", error.message);
      this.connected = false;
      this.lastError = error;
      
      // Try to reconnect in the background
      this.connect().catch(err => console.error("Reconnection attempt failed:", err.message));
      
      return false;
    }
  }
  
  // Synchronous version of isAlive that doesn't perform an actual ping
  // This is faster but less accurate - useful for quick checks
  isConnected() {
    return this.connected;
  }
  
  // Function to wait for the database connection to be established
  async waitConnection() {
    if (this.connected && this.db) {
      return this.db;
    }
    
    // If already connecting, return the existing promise
    if (this.connecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    
    // Otherwise, try to connect
    return this.connect();
  }
  
  // Function to get the connection status for diagnostics
  getStatus() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      attempts: this.connectionAttempts,
      lastError: this.lastError ? {
        message: this.lastError.message,
        code: this.lastError.code,
        time: this.lastError.time
      } : null,
      lastConnectionTime: this.lastConnectionTime
    };
  }

  // asynchronous function nbUsers that returns
  // the number of documents in the collection users
  async nbUsers() {
    try {
      // Wait for the connection to be established
      await this.waitConnection();
      
      // Get the collection users and count documents
      return this.db.collection("users").countDocuments();
    } catch (error) {
      console.error("Error counting users:", error.message);
      return 0;
    }
  }

  // asynchronous function nbFiles that returns
  // the number of documents in the collection files
  async nbFiles() {
    try {
      // Wait for the connection to be established
      await this.waitConnection();
      
      // Get the collection files and count documents
      return this.db.collection("files").countDocuments();
    } catch (error) {
      console.error("Error counting files:", error.message);
      return 0;
    }
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (dbClient.client) {
    console.log('Closing MongoDB connection...');
    try {
      await dbClient.client.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
  process.exit(0);
});

export default dbClient;
