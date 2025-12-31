
// Tasks (critical):
//  1) Parse productId and quantity from request.
//  2) Ensure the order decrements stock atomically and never allows stock < 0.
//     - Option 1: Use MongoDB findOneAndUpdate with conditional ($inc) which is atomic on a single document.
//     - Option 2 (bonus): Use Redis atomic DECRBY or Redis lock to guard against race conditions in a distributed system.
//  3) Invalidate or update Redis product cache after successful stock change.
//  4) Return clear HTTP responses for success and failure.

import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { redis, productCacheKey, productStockKey } from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { productId, quantity } = body;
  if (!productId || typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "Invalid productId or quantity" }, { status: 400 });
  }

  await connectToMongoDB();

  // Approach implemented here: MongoDB atomic update
  // This is safe for single-document stock updates: findOneAndUpdate with a condition ensures stock won't go negative.
  const updated = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } }, // ensure enough stock
    { $inc: { stock: -quantity } }, // decrement
    { new: true }
  ).lean();

  if (!updated) {
    // Did not update -> either product not found or not enough stock
    const exists = await Product.findById(productId).lean();
    if (!exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
  }

  // TODO (Candidate): Update/invalidate caches
  // - Update per-product cache: await redis.set(productCacheKey(productId), JSON.stringify(updated))
  // - Optionally update a products list cache or clear it: await redis.del("products:all")
  try {
    await redis.set(productCacheKey(productId), JSON.stringify(updated));
    await redis.del("products:all"); // simple invalidation for list cache
    // Optionally sync stock to a dedicated redis key:
    await redis.set(productStockKey(productId), String(updated.stock));
  } catch (err) {
    console.warn("Redis write failed (non-fatal)", err);
  }

  // Return the updated product state
  return NextResponse.json({ success: true, product: updated });
}

/*
BONUS (talking points for candidate):
 - If this were a high scale distributed system, discuss:
    * Using a Redis DECRBY when stock is mirrored in Redis and backing off to DB on success/failure.
    * Using a small Lua script in Redis to conditionally decrement and publish events.
    * Using a distributed lock (SETNX + TTL) before reading/writing DB (but avoid as first option).
    * Eventual consistency vs. strong consistency trade-offs and how you'd reconcile if Redis and Mongo disagree.
*/
