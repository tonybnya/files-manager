import { createClient } from "redis";

// class RedisClient
class RedisClient {
  // contructor to create client to Redis
  constructor() {
    this.client = createClient();
    // display any error in the console
    this.client.on("error", (err) => console.error("Redis Client Error", err));
    // connect at startup
    this.client.connect();
  }

  // function to check the status of the connection to Redis
  isAlive() {
    return this.client.isOpen;
  }

  // asynchronous function that takes a string key as argument
  // and returns the Redis value stored for this key
  async get(key) {
    return await this.client.get(key);
  }

  // asynchronous function that takes a string key,
  // a value and a duration in second as arguments to store it in Redis
  // (with an expiration set by the duration argument)
  async set(key, value, duration) {
    await this.client.set(key, value, {
      EX: duration,
    });
  }

  // asynchronous function that takes a string key as argument
  // and remove the value in Redis for this key
  async del(key) {
    await this.client.del(key);
  }
}

// create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
