import {Redis} from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://default:rFgtIZJrZeZ0SZCKkNeSVuwfxCwT1b0d@calico-waterlily-indubitable-96511.db.redis.io:11947";

/**
 * Command connection used for reads,writes and publishing.
 */
export const redis = new Redis(REDIS_URL);

/**
 * A connection in subscriber mode cannot run normal commands, so it needs its own client.
 * Dedicated connection for keyspace and application channel subscriptions.
 */
export const redisSubscriber = new Redis(REDIS_URL)

redis.on("error",(err) => {
    console.error("[redis] client error:",err);
})

redisSubscriber.on("error",(err) => {
    console.error("[redis] subscriber error:",err);
})


redis.once("ready",() => {
    console.log("[redis] client connected");
})

redisSubscriber.once("ready",() => {
    console.log("[redis] client connected");
})