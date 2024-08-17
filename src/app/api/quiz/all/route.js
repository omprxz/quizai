import Db from "@/utils/db";
import Quiz from "@/models/quiz";
import Response from "@/models/response";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

export async function GET(req) {
  const cookieStore = cookies();
  try {
    await Db();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const filter = url.searchParams.get('filter');
    
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({
        message: 'AUTH ERR: No Token Provided',
        success: false
      }, {
        status: 403
      });
    }
    
    let tokenDetails;
    try {
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({
        message: 'AUTH ERR: ' + e.message,
        success: false
      }, {
        status: 403
      });
    }
    
    if(filter == 'response_count'){
      let quizDetails = await Quiz.find({ userid: tokenDetails.data._id }).sort({ updatedAt: -1 }).select('_id');
      
    if (quizDetails.length !== 0) {
      quizDetails = await Promise.all(
        quizDetails.map(async (quiz) => {
          const responseCount = await Response.countDocuments({ quizid: quiz._id });
          return {
            ...quiz.toObject(),
            response_count: responseCount
          };
        })
      );
      
      return NextResponse.json({ quizzes: quizDetails, success: true });
    } else {
      return NextResponse.json({
        message: 'You don\'t have any quiz',
        success: false
      }, {
        status: 404
      });
    }
      
    }else{
      let quizDetails = await Quiz.find({ userid: tokenDetails.data._id }).sort({ updatedAt: -1 }).select("-questions");
      if (quizDetails.length !== 0) {
      
      return NextResponse.json({ quizzes: quizDetails, success: true });
      } else {
      return NextResponse.json({
        message: 'You don\'t have any quiz',
        success: false
      }, {
        status: 404
      });
    }
    }

  } catch (error) {
    console.log('Server error:', error);
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, {
      status: 500
    });
  }
}