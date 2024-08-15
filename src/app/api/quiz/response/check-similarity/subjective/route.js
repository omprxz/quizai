import { NextResponse } from 'next/server';
const natural = require('natural');
const { JaroWinklerDistance } = natural;

function checkAnswer(userAnswer, correctAnswer) {
  const similarityScore = JaroWinklerDistance(userAnswer ?? '', correctAnswer ?? '');
  return { score: similarityScore, correct: similarityScore > 0.5 };
}

export async function POST(request) {
  try {
    const { answers } = await request.json();
  
    const results = answers.map(({ correct = '', user = '', questionId = null }) => {
      const { score } = checkAnswer(user, correct);
      return { score, questionId };
    });

    return NextResponse.json({
      message: 'Successfully evaluated marks',
      data: results
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error evaluating marks',
      error: error.message
    }, { status: 500 });
  }
}