import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/** Convert a Mongoose document (or array of documents) to a plain JSON-safe object,
 *  turning ObjectIds into strings and adding an `id` field. */
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/** Recursively walk a serialized object/array and add an `id` field
 *  (string) wherever an `_id` field is present — convenient for client components. */
export function withIds(value: any): any {
  if (Array.isArray(value)) return value.map(withIds);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = withIds(v);
    }
    if (out._id !== undefined) out.id = out._id;
    return out;
  }
  return value;
}

/** serialize() + withIds() in one call — use for data passed from server components to client components. */
export function toClient<T>(doc: T): any {
  return withIds(serialize(doc));
}
