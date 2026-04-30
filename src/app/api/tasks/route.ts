import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/model/Task";
import { getAuthUser } from "@/lib/auth";
import { ApiResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return ApiResponse.error("Unauthorized", 401);

    await dbConnect();
    const tasks = await Task.find({ author: user.id }).sort({ createdAt: -1 });

    return ApiResponse.success(tasks);
  } catch (error: any) {
    return ApiResponse.error(error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return ApiResponse.error("Unauthorized", 401);

    const body = await req.json();
    const { content, priority, deadline, status } = body;

    if (!content) return ApiResponse.error("Content is required", 400);

    await dbConnect();
    const task = await Task.create({
      content,
      priority: priority || "medium",
      deadline,
      status: status || "todo",
      isCompleted: status === "completed",
      author: user.id,
    });

    return ApiResponse.success(task, "Task created successfully", 201);
  } catch (error: any) {
    return ApiResponse.error(error.message);
  }
}
