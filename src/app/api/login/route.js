import Db from "@/utils/db"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"

export async function POST(req){
  await Db()
  const { email, password } = await req.json()
  
  if(!email){
    return NextResponse.json({
      message: "Email required"
    },{
      status:400
      })
  }
  if(!password){
    return NextResponse.json({
      message: "Password required"
    },{
      status:400
      })
  }
  
  const userDetail = await User.findOne({email})
  const isValid = await bcrypt.compare(password, userDetail.password)
  if(isValid){
    const token = jwt.sign({
      data: userDetail
    }, process.env.JWT_SECRET,{expiresIn: '10d'})
    return NextResponse.json({
      message: "Logged in successfully",
      success: true,
      token
    },{
      status:200
    })
  }else{
    return NextResponse.json({
      message: "Invalid credentials.",
      success: false
    }, {
      status: 400
      })
  }
  
}


export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}