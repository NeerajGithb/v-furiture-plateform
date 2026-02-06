import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { authService } from "@/lib/domain/auth/AuthService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { getCurrentSeller, getCurrentAdmin } from "@/lib/middleware/authUtils";

export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") as 'seller' | 'admin' || 'seller';

    let currentUser;
    if (userType === 'seller') {
      currentUser = await getCurrentSeller(request);
    } else {
      currentUser = await getCurrentAdmin(request);
    }

    if (!currentUser) {
      return ApiResponseBuilder.unauthorized("No valid session found");
    }

    // Return the token payload which contains all necessary user info
    return ApiResponseBuilder.success({
      user: currentUser,
    });
  }),
);