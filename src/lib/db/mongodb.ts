import mongoose from "mongoose";
// Import all models to register them with Mongoose
import "@/models";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) throw new Error("MONGODB_URI is missing!");

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  // Return existing connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected (Platform)');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection failed (Platform):', err.message);
        cached.promise = null; // Reset promise on failure
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise on failure
    throw error;
  }

  return cached.conn;
}

// Legacy export for backward compatibility
export default async function dbConnect() {
  return connectDB();
}

