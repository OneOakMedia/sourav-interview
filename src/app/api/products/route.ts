import { connectToMongoDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToMongoDB();

  // TODO (Candidate):
  // Implement cache-aside strategy:
  // 1. Try fetching products list from Redis
  // 2. If not found, fetch from MongoDB
  // 3. Store result in Redis (with optional TTL)

  const products = await Product.find().lean();

  return NextResponse.json(products);
}
