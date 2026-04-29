import { ApiResponse } from "@/utils/apiResponse";
import { loginSchema } from "@/schema/loginSchema";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);

    await dbConnect();

    const { email, password } = validatedData;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return ApiResponse.error("Invalid credentials", 401);
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return ApiResponse.error("Invalid credentials", 401);
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies for authentication
    const cookieStore = await cookies();
    
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return ApiResponse.success(
      { 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email 
        } 
      }, 
      "Login successful"
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return ApiResponse.error("Validation failed", 400, error.errors);
    }
    return ApiResponse.error(error.message || "Login failed", 401);
  }
}