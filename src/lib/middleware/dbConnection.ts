import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../db/mongodb";
import { DatabaseConnectionError } from "../domain/shared/InfrastructureError";

export function withDB<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      await connectDB();
      return await handler(request, ...args);
    } catch (error) {
      console.error("Database connection error:", error);
      
      const dbError = new DatabaseConnectionError();
      return NextResponse.json(
        { 
          error: dbError.message, 
          code: "DB_CONNECTION_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}