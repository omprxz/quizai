import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import Db from '@/utils/db'
import Response from '@/models/response'
import User from '@/models/user'
import Quiz from '@/models/quiz'
import {cookies} from 'next/headers'

export async function GET(req) {
  await Db()
  const cookieStore = cookies()
  const url = new URL(req.url)
  const filter = url.searchParams.get('filter')
  let responsesWithDetails
  try{
  let responseDets, quizid
  quizid = url.searchParams?.get('id')
  if(filter=='quizid'){
    if (!mongoose.isValidObjectId(quizid)) {
      return NextResponse.json({
        message: 'Invalid Quiz ID',
        success: false
      }, {
        status: 400
      });
    }
    
    const quizDets = await Quiz.findOne({_id:quizid}).select("_id")
    if(!quizDets){
    return NextResponse.json({
      message: 'Quiz doesn\'t exists'
    }, {
      status: 404
    })
  }
   responseDets = await Response.find({ quizid }).sort({ updatedAt: -1 }).select('_id title username userid percentage passing_score timeTaken createdAt')
   
   responsesWithDetails = await Promise.all(
    responseDets.map(async (response) => {
      if (response.userid) {
        const userDets = await User.findById(response.userid).select('-password')
        if (userDets) {
          return {
            ...response._doc,
            username: userDets.name
          }
        }
      }
      return response
    })
  )
  }else if(filter=='user'){
    const token = cookieStore.get('token')?.value
    if(!token){
      return NextResponse.json({
        message: 'AUTH ERR: Loggin first'
      }, {
        status: 403
      })
    }
    try{
    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
    
    const userid = tokenDetails?.data?._id || undefined
    if(!userid){
      return NextResponse.json({
        message: 'Invalid user'
      },{
        status:403 })
    }
   responseDets = await Response.find({ userid }).sort({ updatedAt: -1 }).select('_id quizid percentage passing_score timeTaken createdAt')
   
 responsesWithDetails = await Promise.all(
    responseDets.map(async (response) => {
      if (response.quizid) {
        const qDets = await Quiz.findById(response.quizid).select('title')
        if (qDets) {
          return {
            ...response._doc,
            title: qDets.title
          }
        }
      }
      return response
    })
  )
    }catch(e){
      return NextResponse.json({
        message: 'AUTH ERR: Invalid token'
      }, {
        status: 403
      })
    }
  }else{
    return NextResponse.json({
      message: 'Invalid filter'
    }, {
      status: 403
    })
  }
  

  if (!responseDets || responseDets.length === 0) {
    return NextResponse.json({
      message: 'Nothing found'
    }, {
      status: 404
    })
  }


  return NextResponse.json({
    message: 'Working',
    data: {
      quizid,
      responses: responsesWithDetails
    }
  }, {
    status: 200
  })
  } catch (e){
    return NextResponse.json({message: e?.message || 'Something went wrong.'}, {
      status:403 })
  }
}