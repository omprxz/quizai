import Db from "@/utils/db"
import User from "@/models/user"
import Otp from "@/models/otp"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function POST(req, {params}){
  await Db()
  
  const { action } = params
  if(action == "modify"){
    const cookieStore = cookies()
    
    const { password, newPassword } = await req.json()
    const token = cookieStore.get('token')?.value
    
    if(!token){
      return NextResponse.json({
        message: "User not logged in"
      }, {
        status: 400
      })
    }
    
    if(!password){
      return NextResponse.json({
        message: "Password required"
      }, {
        status: 400
      })
    }
    if(!newPassword){
      return NextResponse.json({
        message: "New password required"
      }, {
        status: 400
      })
    }
    if(!token){
      return NextResponse.json({
        message: "Token required"
      }, {
        status: 400
      })
    }
    let userDetails
    try{
      userDetails = await jwt.verify(token, process.env.JWT_SECRET)
    }catch (e){
      if(e.name=== 'TokenExpiredError'){
        return NextResponse.json({
          message: "Token expired, login again"
        },
        {
          status: 401
        })
      }else{
        return NextResponse.json({
          message: "Something wemt wrong"
        },
        {
          status: 500
        })
      }
    }
    
    if(!userDetails){
      return NextResponse.json({
        message:"Invalid token"
      }, {
        status: 400
      })
    }
    
    const currPassword = await User.findOne({email: userDetails.data.email}).select('password')
    
    const passMatching = await bcrypt.compare(password, currPassword.password)
    if(!passMatching){
      return NextResponse.json({
        message: "Incorrect current password"
      }, {status: 400})
    }
    
    const updatePass = await User.updateOne({email: userDetails.data.email}, {password: await bcrypt.hash(newPassword, 10)})
    
    if(!updatePass || updatePass.modifiedCount == 0){
      return NextResponse.json({
        message: "Something went wrong",
        success: false
      }, {
        status: 400
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Password changed"
    }, {
      status: 200
      })
    
    
  }else if(action == "reset"){
    let {
      otp, email, newPassword
    } = await req.json()
    email = email.toLowerCase();
    
    if(!otp){
      return NextResponse.json({
        message: "OTP required"
      }, {status:400})
    }
    if(!email){
      return NextResponse.json({
        message: "Email required"
      }, {status:400})
    }
    if(!newPassword){
      return NextResponse.json({
        message: "New password required"
      }, {status:400})
    }
    
    const OtpDetails = await Otp.findOne({otp, email})
    if(!OtpDetails){
      return NextResponse.json({
      message: "Incorrect OTP",
    }, {
      status: 500
    })
    }
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    if(OtpDetails.createdAt < thirtyMinutesAgo){
      return NextResponse.json({
      message: "OTP Expired"
    }, {
      status:400
    })
    }
    
    const updatePass = await User.updateOne({email}, {password: await bcrypt.hash(newPassword, 10)})
    
    if(!updatePass || updatePass.modifiedCount == 0){
      return NextResponse.json({
        message: "Something went wrong",
        success: false
      }, {
        status: 400
      })
    }
    
    return NextResponse.json({
      message: "Password reset",
      success: true
    })
  }else{
    return NextResponse.json({
      message: "Action not found."
    },{
      status: 404
    }
      )
  }
}