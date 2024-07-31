import { NextResponse } from 'next/server';

export async function GET(req) {
  const response = NextResponse.json(
    {
      message: "Logged out",
      success: true,
    },
    {
      status: 200,
    }
  );
  response.cookies.set("token", "", { maxAge: -1 });
  return response;
}