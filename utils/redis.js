import { createClient } from "redis";

// class RedisClient
class RedisClient {
  // contructor to create client to Redis
  constructor() {
    this.client = createClient();
    this.client.on("error", (err) => console.log("Redis client error", err));
  }
}

// create and export an instance of RedisClient
const redisClient = RedisClient();
export { redisClient };
