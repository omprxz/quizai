import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Db from '@/utils/db';
import User from '@/models/user';

export async function DELETE() {
  try {
    await Db();

    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Token not provided' }, { status: 401 });
    }

    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDetails) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const result = await User.deleteOne({ _id: tokenDetails.data._id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}