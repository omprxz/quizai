import Db from '@/utils/db';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await Db();

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return NextResponse.json({ message: 'User registered successfully', success: true }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}