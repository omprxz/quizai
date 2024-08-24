import {NextResponse} from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import Db from '@/utils/db'
import Feedback from '@/models/feedback'

export async function POST(req){
  let { name, email, category, message } = await req.json()
  email = email.toLowerCase();
  try{
  await Db();
  
  const cookiesStore = cookies()
  const token = cookiesStore?.get('token')?.value
  let tokenDetails;
  if(token){
    try{
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
    }catch(e){}
  }
  
  if(!tokenDetails?.data?.name && !name){
    return NextResponse.json({
      message: 'Name can\'t be empty.'
    }, {
      status: 403 })
  }
  if(!tokenDetails?.data?.email && !email){
    return NextResponse.json({
      message: 'Email can\'t be empty.'
    }, {
      status: 403 })
  }
  
  const userId = tokenDetails?.data?._id
  
  if(!message){
    return NextResponse.json({
      message: 'Message can\'t be empty.'
    }, {
      status: 403 })
  }
  if(!category){
    return NextResponse.json({
      message: 'Category can\'t be empty.'
    }, {
      status: 403 })
  }
  
  const newFeedback = new Feedback({
    name: tokenDetails?.data?.name || name,
    email: tokenDetails?.data?.email || email,
    message: message,
    category: category,
    userid: userId
  })
  
  await newFeedback.save()
  
  return NextResponse.json({ message: 'Feedback saved.', success: true }, { status: 200 });
  
  }catch(e){
    console.log(e.message || e)
     return NextResponse.json({
      message: 'Something went wrong.'
    }, {
      status: 403 })
  }
}