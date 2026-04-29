import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/model/Task";
import { getAuthUser } from "@/lib/auth";
import { ApiResponse } from "@/utils/apiResponse";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return ApiResponse.error("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    await dbConnect();
    
    const task = await Task.findOneAndUpdate(
      { _id: id, author: user.id },
      { $set: body },
      { new: true }
    );

    if (!task) return ApiResponse.error("Task not found", 404);

    return ApiResponse.success(task, "Task updated successfully");
  } catch (error: any) {
    return ApiResponse.error(error.message);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return ApiResponse.error("Unauthorized", 401);

    const { id } = await params;

    await dbConnect();
    const task = await Task.findOneAndDelete({ _id: id, author: user.id });

    if (!task) return ApiResponse.error("Task not found", 404);

    return ApiResponse.success(null, "Task deleted successfully");
  } catch (error: any) {
    return ApiResponse.error(error.message);
  }
}
