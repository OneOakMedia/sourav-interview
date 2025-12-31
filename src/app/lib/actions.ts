// app/lib/actions.ts
// Server actions for simple admin operations (create/delete product).
// Candidate TODO: After creating or deleting a product, invalidate product list cache (products:all)
// So the UI reflects created/deleted items immediately.

"use server";
import { connectToMongoDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  await connectToMongoDB();

  const name = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const price = parseFloat(String(formData.get("price") || "0"));
  const stock = parseInt(String(formData.get("stock") || "0"), 10);

  // Input validation (minimal)
  if (!name || !price) {
    throw new Error("Invalid input");
  }

  const product = await Product.create({ name, description, price, stock });

  // TODO (Candidate): Invalidate the product list cache so GET /api/products returns fresh data.
  // e.g. await redis.del("products:all")
  try {
    await redis.del("products:all");
    await redis.set(`product:data:${product._id}`, JSON.stringify(product));
  } catch (err) {
    // non-fatal
    console.warn("Redis invalidate failed", err);
  }

  // Revalidate Next.js path so Server Components update
  revalidatePath("/");
}

export async function deleteProduct(formData: FormData) {
  await connectToMongoDB();
  const id = String(formData.get("id"));
  if (!id) throw new Error("Missing id");
  await Product.deleteOne({ _id: id });

  // TODO (Candidate): Invalidate caches as appropriate
  try {
    await redis.del("products:all");
    await redis.del(`product:data:${id}`);
  } catch (err) {
    console.warn("Redis invalidate failed", err);
  }
  revalidatePath("/");
}
