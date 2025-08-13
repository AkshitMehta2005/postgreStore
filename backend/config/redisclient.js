// backend/config/redisClient.js
import Redis from "ioredis";

// Create a Redis client instance
const redisClient = new Redis();

// Event listeners
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export default redisClient;
