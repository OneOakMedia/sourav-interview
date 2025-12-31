// lib/redis.ts
import { Redis } from "@upstash/redis";
export const redis = Redis.fromEnv();

export function productStockKey(productId: string) {
  return `product:stock:${productId}`;
}

export function productCacheKey(productId: string) {
  return `product:data:${productId}`;
}