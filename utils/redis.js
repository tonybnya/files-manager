import { createClient } from "redis";

// class RedisClient
class RedisClient {
  // contructor to create client to Redis
  constructor() {
    this.client = createClient();
    this.client.on("error", (err) => console.log("Redis client error", err));
    this.isClientConnected = false;

    // check connection to Redis
    this.isAlive();
  }

  // function to check the connection to Redis
  async isAlive() {
    if (!this.isClientConnected) {
      try {
        await this.client.connect();
        this.isClientConnected = true;
        console.log("Redis client connected.");
      } catch (err) {
        console.log("Redis connection error:", err);
        return false;
      }
    }
    return this.isClientConnected;
  }

  // function to get a value stored by its key
  async get(key) {
    if (!this.isClientConnected) {
      await this.isAlive();
    }

    return await this.client.get(key);
  }

  // function to store a key/value pair with an expiration
  async set(key, value, duration) {
    if (!this.isClientConnected) {
      await this.isAlive();
    }

    await this.client.set(key, value);

    if (duration) {
      await this.client.expire(key, duration);
    }
  }

  // function to remove a value in Redis by its key
  async del(key) {
    if (!this.isClientConnected) {
      await this.isAlive();
    }

    await this.client.del(key);
  }
}

// create and export an instance of RedisClient
const redisClient = new RedisClient();
export { redisClient };
