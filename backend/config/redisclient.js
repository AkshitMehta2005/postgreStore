import Redis from "ioredis";

const redisClient = new Redis(); // defaults to localhost:6379

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export default redisClient;
