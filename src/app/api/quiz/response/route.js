import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Response from '@/models/response';
import Quiz from '@/models/quiz';
import User from '@/models/user';
import Db from '@/utils/db'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';

export async function POST(request) {
  let tokenDetails
  try {
    await Db();
    const cookieStore = cookies()

    const data = await request.json();
    
    try{
    const token = cookieStore.get('token').value
    try{
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
    }catch(e){
      console.log(e)
        }
    }catch(err){
         console.log(err)
        }

    if (!data.quizid) {
      return NextResponse.json({ message: 'Quiz ID is missing.' }, { status: 400 });
    }

    const response = new Response({
      userid: tokenDetails?.data?._id ? tokenDetails?.data?._id : null,
      username: data.username || 'Unknown',
      quizid: data.quizid,
      selectedAnswers: data.selectedAnswers || {},
      correct: data.correct || 0,
      wrong: data.wrong || 0,
      notAttempted: data.notAttempted || 0,
      total_questions: data.total_questions,
      percentage: data.percentage || 0,
      timeTaken: data.timeTaken || null
    });

    const saveResponse = await response.save();

    return NextResponse.json({ message: 'Answer saved successfully.', data: {
      responseId: saveResponse._id
    }, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await Db();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const cookieStore = cookies();

    if (!id) {
      return NextResponse.json({
        message: 'No ID provided',
        success: false
      }, {
        status: 400
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({
        message: 'Invalid Response ID',
        success: false
      }, {
        status: 400
      });
    }

    let responseDetails = await Response.findById(id);
    if (!responseDetails) {
      return NextResponse.json({
        message: 'Response not found',
        success: false
      }, {
        status: 404
      });
    }
    responseDetails = {...responseDetails._doc}
    const responseDetailsByQuiz = await Response.find({quizid: responseDetails.quizid}).select("_id percentage timeTaken")
    const sortedResponses = responseDetailsByQuiz.sort((a, b) => {
      if(a.percentage == b.percentage){
        return a.timeTaken - b.timeTaken
      }
      return a.percentage - b.percentage
    })
    const responseRank = sortedResponses.findIndex(res => res._id == id) + 1
    
    responseDetails.quizResponsesCount = responseDetailsByQuiz.length
    responseDetails.rank = responseRank || 0
    const quizDetails = await Quiz.findById(responseDetails.quizid);
    if (quizDetails) {
      responseDetails.quiz = true
      responseDetails.quizTitle = quizDetails.title || "No title";
      if(quizDetails.passing_score){
        responseDetails.quizPassing_score = quizDetails.passing_score
      }
      responseDetails.quizId = quizDetails._id
    } else {
      responseDetails.quizTitle = "Quiz not found";
    }

    if (!responseDetails.userid) {
      return NextResponse.json(responseDetails);
    }

    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Log in to view this result' }, { status: 401 });
    }

    let tokenDetails;
    try {
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ message: 'AUTH ERR: Invalid token' }, { status: 401 });
    }

    if (responseDetails.userid !== tokenDetails.data._id) {
      return NextResponse.json({ message: 'This response is not submitted by the current logged-in user' }, { status: 403 });
    }

    const userDetails = await User.findById(responseDetails.userid);
    if (userDetails) {
      responseDetails.username = userDetails.name;
    } else {
      console.log('User not found for userid:', responseDetails.userid);
      responseDetails.username = "User not found";
    }

    return NextResponse.json(responseDetails);

  } catch (error) {
    console.log('Server ERR:', error);
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, {
      status: 500
    });
  }
}