import { ApiResponse } from "@/utils/apiResponse";
import { registerSchema } from "@/schema/registerSchema";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = registerSchema.parse(body);

    await dbConnect();

    const { username, email, password } = validatedData;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return ApiResponse.error("User with this email or username already exists", 400);
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    return ApiResponse.success(userData, "User registered successfully", 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return ApiResponse.error("Validation failed", 400, error.errors);
    }
    return ApiResponse.error(error.message || "Registration failed", 400);
  }
}