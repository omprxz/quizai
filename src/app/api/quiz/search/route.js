import Db from "@/utils/db";
import Quiz from "@/models/quiz";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await Db();
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('term');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '15');
    
    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({
        message: 'Search term must be at least 2 characters',
        success: false
      }, {
        status: 400
      });
    }

    const skip = (page - 1) * limit;
    
    // Build search query to match against multiple fields
    const searchQuery = {
      visibility: 'public', // Only search for public quizzes
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { level: { $regex: searchTerm, $options: 'i' } },
        { language: { $regex: searchTerm, $options: 'i' } },
        { type: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Get total count for pagination
    const totalQuizzes = await Quiz.countDocuments(searchQuery);
    
    // Get paginated results
    const quizzes = await Quiz.find(searchQuery)
      .select("title description type level category duration language total_questions visibility createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      quizzes,
      total: totalQuizzes,
      page,
      limit,
      hasMore: skip + quizzes.length < totalQuizzes,
      success: true
    });
    
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