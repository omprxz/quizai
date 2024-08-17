import { NextResponse } from 'next/server';
import Quiz from '@/models/quiz';
import Db from '@/utils/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function PATCH(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'AUTH ERR: Not logged in' }, { status: 401 });
    }

    let tokenDetails;
    try {
      tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'AUTH ERR: Invalid token' }, { status: 401 });
    }

    const { id, visibility } = await request.json();

    if (!id || !['public', 'private'].includes(visibility)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    await Db();

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.userid !== tokenDetails.data._id) {
      return NextResponse.json({ message: "AUTH ERR: You don't have access to this quiz" }, { status: 403 });
    }

    quiz.visibility = visibility;
    await quiz.save();

    return NextResponse.json({ message: 'Quiz updated to ' + visibility }, { status: 200 });
  } catch (error) {
    console.error('Error updating visibility:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}