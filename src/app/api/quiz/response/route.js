import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Response from '@/models/response';
import Quiz from '@/models/quiz';
import User from '@/models/user';
import Db from '@/utils/db'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';
const natural = require('natural');
const { JaroWinklerDistance } = natural;

async function checkAnswer(userAnswer, correctAnswer) {
  const similarityScore = await JaroWinklerDistance(userAnswer ?? '', correctAnswer ?? '');
  return { score: similarityScore, correct: similarityScore > 0.7 };
}

export async function POST(request) {
  let tokenDetails
  try {
    await Db();
    const cookieStore = cookies()

    let {timeTaken, selectedAnswers, username, quizid} = await request.json();
    let userid
    const token = cookieStore.get('token')?.value
    if(token){
    try{
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
      if(!username){
        userid = tokenDetails?.data?._id
      }
    }catch(e){
      console.error(e)
        }
    }
        
    if(!username && !userid){
      return NextResponse.json({message: 'Name must be provided.'}, {status: 403})
    }

    if (!quizid) {
      return NextResponse.json({ message: 'Quiz ID is missing.' }, { status: 400 });
    }
    
    let quizDetails = await Quiz.findById(quizid).lean()
    
    if(!quizDetails){
      return NextResponse.json({
        message: 'Quiz not found'
      },{
        status:404
        })
    }
    
    let totalCorrect = 0;
  let totalWrong = 0;
  let notAttempted = 0;
  let percentageScored = 0;
  let totalQuestions = quizDetails.questions.length;
  
  for (const question of quizDetails.questions) {
  if (question.question_type === 'subjective') {
    if (
      selectedAnswers[question._id] &&
      selectedAnswers[question._id]?.[0] !== null &&
      selectedAnswers[question._id]?.[0].trim() !== ""
    ) {
      const { score, correct } = await checkAnswer(
        selectedAnswers[question._id]?.[0],
        question.correct_answers?.[0]
      );
      if (correct) {
        question.result = 'correct';
        totalCorrect++;
      } else {
        question.result = 'wrong';
        totalWrong++;
      }
    } else {
      question.result = 'skipped';
      notAttempted++;
    }
  } else {
    const correctAnswers = question.correct_answers;
    const userAnswers = selectedAnswers[question._id] || [];

    if (userAnswers.length === 0) {
      question.result = 'skipped';
      notAttempted++;
    } else if (question.question_type === 'single_correct') {
      const correct =
        correctAnswers.length === 1 &&
        correctAnswers?.[0] === userAnswers?.[0];
      if (correct) {
        question.result = 'correct';
        totalCorrect++;
      } else {
        question.result = 'wrong';
        totalWrong++;
      }
    } else if (question.question_type === 'multi_correct') {
      const correctSet = new Set(correctAnswers);
      const userSet = new Set(userAnswers);

      if (
        userSet.size === correctSet.size &&
        [...userSet].every((answer) => correctSet.has(answer))
      ) {
        question.result = 'correct';
        totalCorrect++;
      } else {
        question.result = 'wrong';
        totalWrong++;
      }
    }
  }
  question.selected_answers = selectedAnswers[question._id] || []
}

percentageScored = (totalCorrect / totalQuestions) * 100;

const newResponse = await Response({
  userid,
  username,
  quizid,
  questions: quizDetails.questions,
  correct: totalCorrect,
  wrong: totalWrong,
  notAttempted: notAttempted,
  total_questions: totalQuestions,
  passing_score: quizDetails?.passing_score,
  percentage: percentageScored,
  timeTaken
})

const saveResponse = await newResponse.save()
const responseId = saveResponse._id

return NextResponse.json({
  message: 'Result evaluated',
  success: true,
  data: {
    totalCorrect,
    totalWrong,
    notAttempted,
    percentageScored,
    timeTaken,
    responseId
  },
});
    
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

    let responseDetails = await Response.findById(id).lean();
    if (!responseDetails) {
      return NextResponse.json({
        message: 'Response not found',
        success: false
      }, {
        status: 404
      });
    }
    const responseDetailsByQuiz = await Response.find({quizid: responseDetails.quizid}).select("_id percentage timeTaken")
    const sortedResponses = responseDetailsByQuiz.sort((a, b) => {
      if(a.percentage == b.percentage){
        return a.timeTaken - b.timeTaken
      }
      return b.percentage - a.percentage
    })
    const responseRank = sortedResponses.findIndex(res => res._id == id) + 1
    
    responseDetails.quizResponsesCount = responseDetailsByQuiz.length
    responseDetails.rank = responseRank || 0
    let quizDetails = await Quiz.findById(responseDetails.quizid).select('_id title').lean();
    if (quizDetails) {
      responseDetails.quiz = true
      quizDetails.title = quizDetails?.title || "No title";
      responseDetails.quizDetails = quizDetails
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

    if (responseDetails.userid !== tokenDetails.data._id && responseDetails.quizDetails.userid !== tokenDetails.data._id) {
      return NextResponse.json({ message: 'This response is not submitted by the current logged-in user' }, { status: 403 });
    }

    const userDetails = await User.findById(responseDetails.userid);
    if (userDetails) {
      responseDetails.username = userDetails.name;
    } else {
      console.error('User not found for userid:', responseDetails.userid);
      responseDetails.username = "User not found";
    }
    console.log(responseDetails)
    return NextResponse.json(responseDetails);

  } catch (error) {
    console.error('Server ERR:', error);
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, {
      status: 500
    });
  }
}