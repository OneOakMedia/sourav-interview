// Redis client (Upstash)
// Candidate may use this for caching or atomic operations

import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const productCacheKey = (id: string) => `product:${id}`;
export const productListKey = "products:all";
