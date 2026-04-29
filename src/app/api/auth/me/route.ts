import { getAuthUser } from "@/lib/auth";
import { ApiResponse } from "@/utils/apiResponse";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return ApiResponse.error("Unauthorized", 401);
    }

    await dbConnect();
    const user = await User.findById(authUser.id).select("-password -refreshToken");

    if (!user) {
      return ApiResponse.error("User not found", 404);
    }

    return ApiResponse.success({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error: any) {
    return ApiResponse.error(error.message);
  }
}
