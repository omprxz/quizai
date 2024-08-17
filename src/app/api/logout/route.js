import { NextResponse } from "next/server"
import { cookies } from 'next/headers';

export async function GET(req) {
  const cookieStore = cookies();
  cookieStore.set("token", "", { maxAge: -1 });
  return NextResponse.json(
    {
      message: "Logged out",
      success: true,
    },
    {
      status: 200,
    }
  );
}