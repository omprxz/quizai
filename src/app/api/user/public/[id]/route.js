import { NextResponse } from 'next/server';
import Db from '@/utils/db';
import User from '@/models/user';
import Quiz from '@/models/quiz';
import Response from '@/models/response';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await Db();
    const { id } = params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({
        message: 'Invalid user ID',
        success: false
      }, { status: 400 });
    }

    // Get basic user information (excluding sensitive fields)
    const user = await User.findById(id).select('name email createdAt image');
    
    if (!user) {
      return NextResponse.json({
        message: 'User not found',
        success: false
      }, { status: 404 });
    }

    // Get public quizzes created by the user
    const quizzes = await Quiz.find({ 
      userid: id,
      visibility: 'public'
    }).select('title description category level language total_questions duration passing_score createdAt');

    // Get quiz responses by the user (only public quizzes)
    const responses = await Response.aggregate([
      { $match: { userid: id } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizid',
          foreignField: '_id',
          as: 'quizDetails'
        }
      },
      { $unwind: { path: '$quizDetails', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'quizDetails.visibility': 'public' },
            { 'quizDetails.visibility': { $exists: false } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          quizid: 1,
          correct: 1,
          wrong: 1,
          notAttempted: 1,
          total_questions: 1,
          percentage: 1,
          passing_score: 1,
          timeTaken: 1,
          createdAt: 1,
          title: '$quizDetails.title',
          quizVisibility: '$quizDetails.visibility'
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Calculate stats
    const totalQuizzes = quizzes.length;
    const totalResponses = responses.length;
    
    const passedResponses = responses.filter(response => 
      response.passing_score !== null ? 
      response.percentage >= response.passing_score : 
      response.percentage >= 0
    ).length;
    
    const failedResponses = totalResponses - passedResponses;
    
    const passedPercentage = totalResponses > 0 ? (passedResponses / totalResponses) * 100 : 0;
    const failedPercentage = totalResponses > 0 ? (failedResponses / totalResponses) * 100 : 0;

    const avgScore = totalResponses > 0 ? 
      responses.reduce((sum, response) => sum + response.percentage, 0) / totalResponses : 
      0;

    return NextResponse.json({
      success: true,
      data: {
        user,
        quizzes,
        responses,
        stats: {
          totalQuizzes,
          totalResponses,
          passedResponses,
          failedResponses,
          passedPercentage,
          failedPercentage,
          avgScore
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, { status: 500 });
  }
}