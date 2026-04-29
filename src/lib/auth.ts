import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!) as { id: string; email: string } | null;
  
  return decoded;
}
