// scripts/seed.ts
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { connectToMongoDB } from "@/lib/db";

async function seedProducts() {
  await connectToMongoDB();
  await Product.deleteMany({}); // clear existing data

  const products = [];
  for (let i = 0; i < 50; i++) {
    products.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);
  process.exit(0);
}

seedProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
