import { ApiResponse } from "@/utils/apiResponse";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear auth cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return ApiResponse.success(null, "Logged out successfully");
  } catch (error: any) {
    return ApiResponse.error("Logout failed", 500);
  }
}
