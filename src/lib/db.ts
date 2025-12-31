// lib/db.ts
// MongoDB connection helper (Mongoose). Candidate should not need to modify this file.
// It caches connection for Next dev hot reloads.

import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongoConn || { conn: null, promise: null };
global._mongoConn = cached;

export async function connectToMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not set in env");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
