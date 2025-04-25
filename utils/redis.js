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

  // async get(key) {
  //   if (!this.isClientConnected) {
  //     await this.isAlive();
  //   }
  //
  //   return this.client.get(key);
  // }
}

// create and export an instance of RedisClient
const redisClient = RedisClient();
export { redisClient };
