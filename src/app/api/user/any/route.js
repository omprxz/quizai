import Db from "@/utils/db"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { cookies } from 'next/headers';
import { NextResponse } from "next/server"

export async function GET(req) {
  await Db();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
    const userData = await User.findById(id).select("name email createdAt");
    if(userData){
    return NextResponse.json({
      message: "User data fetched",
      data: userData,
      success: true
    }, {
      status: 200
    });
    }else{
    return NextResponse.json({
      message: "fine",
      data: {
        name: 'Deleted User',
        email: 'unknown',
        createdAt: null
      },
      success: true
    }, {
      status: 200
    });
    }
}