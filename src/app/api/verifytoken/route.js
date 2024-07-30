import Db from "@/utils/db"
import User from "@/models/user"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"


export async function POST(req){
  await Db()
  const reqJson = await req.json()
  const token = await reqJson.headers.Authorization.split(' ')?.[1]
  if(!token){
    return NextResponse.json({
      message: "Unauthorised user"
    }, {
      status: 400})
  }
  try{
    const userDetails = jwt.verify(token, process.env.JWT_SECRET)
    const userData = await User.findOne({
      email: userDetails?.data?.email,
      _id: userDetails?.data?._id,
    })
    if(!userData){
       return NextResponse.json({
    message: "No user found",
    success: false
  }, {
    status:401
    })
    }
    const matchPass = userDetails?.data?.password == userData?.password
    if(!matchPass){
      return NextResponse.json({
    message: "Password changed",
    success: false
  }, {
    status:401
    })
    }
    
  return NextResponse.json({
    message: "User verified",
    success: true
  }, {
    status:200
    })
  }catch(e){
    return NextResponse.json({
      message: 'Invalid token',
    }, {
      status: 401
      })
  }

}