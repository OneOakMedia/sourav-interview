// app/api/products/route.ts
// Next.js App Router route handler for /api/products and /api/products/:id
// Candidate tasks:
//  - Implement cache-aside pattern using Redis for GET endpoints
//  - Make sure cached JSON is parsed/serialized correctly
//  - Consider TTL and cache invalidation on writes (where indicated)

import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { redis, productCacheKey } from "@/lib/redis";

export async function GET(req: Request) {
  // GET /api/products  -> list all products
  await connectToMongoDB();

  // TODO (Candidate): Implement cache-aside here
  // Option A: cache entire products list under one key.
  // Option B: fetch IDs and then per-product cache (trade-offs).
  // For simplicity, we will check a single key: 'products:all'.
  const ALL_KEY = "products:all";
  try {
    const cached = await redis.get(ALL_KEY);
    if (cached) {
      // Candidate should ensure cached is valid JSON stringified from DB
      return NextResponse.json(JSON.parse(cached as string));
    }
  } catch (err) {
    // Non-fatal: continue to DB
    console.warn("Redis read failed", err);
  }

  // Fallback to DB
  const products = await Product.find().lean();
  // TODO (Candidate): After fetching, set cache in Redis with TTL
  // e.g. await redis.set(ALL_KEY, JSON.stringify(products), { ex: 60 });
  try {
    await redis.set(ALL_KEY, JSON.stringify(products));
    // Optionally set TTL: await redis.set(ALL_KEY, JSON.stringify(products), { ex: 60 });
  } catch (err) {
    console.warn("Redis set failed", err);
  }
  return NextResponse.json(products);
}

// single product route: GET /api/products/:id
export async function GET_BY_ID(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await connectToMongoDB();

  // TODO (Candidate): Use cache-aside for single product using productCacheKey
  const key = productCacheKey(id);

  try {
    const cached = await redis.get(key);
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
    }
  } catch (err) {
    console.warn("Redis read failed", err);
  }

  const product = await Product.findById(id).lean();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // TODO (Candidate): set cache for single product and choose TTL
  try {
    await redis.set(key, JSON.stringify(product));
  } catch (err) {
    console.warn("Redis set failed", err);
  }

  return NextResponse.json(product);
}
