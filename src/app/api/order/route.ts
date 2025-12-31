import { connectToMongoDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { productId, quantity } = await req.json();

  if (!productId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await connectToMongoDB();

  // TODO (Candidate):
  // Ensure stock is decremented atomically.
  // Stock should NEVER go below 0, even with concurrent requests.
  //
  // Possible approaches:
  // - MongoDB conditional update
  // - Redis atomic operation
  // - Combination of both

  // TODO (Candidate):
  // Invalidate or update Redis cache after successful order

  return NextResponse.json({ success: true });
}
