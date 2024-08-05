import { NextResponse } from 'next/server';
import Quiz from '@/models/quiz';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quizId');

  if (!quizId) {
    return NextResponse.json({ message: 'Quiz ID is required' }, { status: 400 });
  }

  try {
    const quiz = await Quiz.findById(quizId).select('questions');
    
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const questions = quiz.questions.map(question => ({
      _id: question._id,
      correct_answers: question.correct_answers,
    }));

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching updated answers:', error);
    return NextResponse.json({ message: 'An error occurred while fetching updated answers' }, { status: 500 });
  }
}