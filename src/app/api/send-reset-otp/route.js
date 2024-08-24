import Db from "@/utils/db"
import Otp from "@/models/otp"
import User from "@/models/user"
import { NextResponse } from "next/server"
const nodemailer = require("nodemailer")

async function sendEmail(email, otp) {
  const password = process.env.GAMIL_APP_PASSWORD;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'fittrackdesk@gmail.com',
      pass: password
    }
  });

  const message = {
    from: 'fittrackdesk@gmail.com',
    to: email,
    subject: 'QuizAI: Your OTP for Password Reset',
    text: `Your OTP for QuizAI password reset is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(message);
    return { message: 'Email sent!', status: 'success', info };
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}

export async function POST(req){
  await Db()
  let { email } = await req.json()
  email = email.toLowerCase();
  if(!email){
    return NextResponse.json({
      message: "Email required"
    }, {
      status: 401
      })
  }
  
  const emailExists = await User.findOne({email})
  if(!emailExists){
    return NextResponse.json({
      message: "No accounts with this email",
      success: false
    }, {
      status: 400
      })
  }
  
  const otp = Math.floor(Math.random()* (9999 - 1001) + 1000)

  try{
  await sendEmail(email, otp)
  const SaveOtp = await Otp({
    otp, email
  }).save()
  return NextResponse.json({
    message: "OTP Sent",
    success: true
  }, {
    status: 200
    })
  }catch (e){
    console.log('e')
    console.log(e)
    return NextResponse.json({
      message: "Something went wrong",
      error: e.message
    },{
      status: 500
      })
  }
  
}