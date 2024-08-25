import Db from "@/utils/db";
import mongoose from 'mongoose'
import Quiz from "@/models/quiz";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const cookieStore = cookies();
  await Db();
  const id = params.id;

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
      message: 'Invalid Quiz ID',
      success: false
    }, {
      status: 400
    });
  }

  const token = cookieStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({
      message: 'User not logged in',
      success: false
    }, { status: 400 });
  }

  let tokenDetails;
  try {
    tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDetails) {
      return NextResponse.json({
        message: 'User not logged in',
      }, {
        status: 400
      });
    }
  } catch (e) {
    return NextResponse.json({
      message: 'AUTH ERR: ' + e.message
    }, {
      status: 403
    });
  }

  const quizDetails = await Quiz.findById(id);
  if (!quizDetails) {
    return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
  }

  if (quizDetails.userid !== tokenDetails.data._id) {
    return NextResponse.json({ message: 'Quiz was not created by the current logged-in user' }, { status: 403 });
  }

  return NextResponse.json({ quiz: quizDetails });
}


export async function PUT(req, { params }) {
  try {
    let formData = await req.json();
    const id = params.id;
    const isValidObjectId = mongoose.isValidObjectId;

    const filterAndRemoveInvalidIds = (data) => {
      return {
        ...data,
        questions: data.questions.map((question) => {
          const filteredQuestion = { ...question };

          if (!isValidObjectId(filteredQuestion._id)) {
            delete filteredQuestion._id;
          }

          // Handle options based on question type
          if (question.question_type !== 'subjective') {
            filteredQuestion.options = filteredQuestion.options.map((option) => {
              const filteredOption = { ...option };
              if (!isValidObjectId(filteredOption._id)) {
                delete filteredOption._id;
              }
              return filteredOption;
            });
          } else {
            // For subjective questions, ensure correct_answers is an array
            filteredQuestion.correct_answers = Array.isArray(filteredQuestion.correct_answers)
              ? filteredQuestion.correct_answers
              : [filteredQuestion.correct_answers]; 
          }

          return filteredQuestion;
        }),
      };
    };

    if (!formData.title) {
      return NextResponse.json({
        message: 'Title can not be empty',
      }, { status: 403 });
    }

    formData.total_questions = formData.questions.length;

    const uniqueTypes = [...new Set(formData.questions.map(question => question.question_type))];
    formData.type = uniqueTypes;

    formData = filterAndRemoveInvalidIds(formData);

    const quizUpdate = await Quiz.updateOne({
      _id: id
    }, {
      $set: formData
    });

    if (!quizUpdate) {
      return NextResponse.json({
        message: 'Quiz not updated',
        success: false
      }, {
        status: 403
      });
    }

    if (quizUpdate.modifiedCount < 1) {
      return NextResponse.json({
        message: 'Not updated'
      }, { status: 403 });
    } else {
      return NextResponse.json({
        message: 'Quiz updated',
        success: true
      }, { status: 200 });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      message: 'Server ERR ' + e.message,
      success: false
    }, {
      status: 500
    });
  }
}