import { NextResponse } from "next/server"
import { cookies } from 'next/headers';

export async function GET(req) {
  const cookieStore = cookies();
  const response = NextResponse.json(
    {
      message: "Logged out",
      success: true,
    },
    {
      status: 200,
    }
  );
  cookieStore.set("token", "", { maxAge: -1 });
  return response;
}