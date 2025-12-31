import { connectToMongoDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectToMongoDB();

  // TODO (Candidate):
  // Implement cache-aside for single product

  const product = await Product.findById(params.id).lean();

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
