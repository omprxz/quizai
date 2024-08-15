import Db from "@/utils/db";
import User from "@/models/user";
import mongoose from 'mongoose'
import Quiz from "@/models/quiz";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  // ... (Your existing GET logic remains unchanged)
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

    console.log(formData);

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

    console.log(quizUpdate);

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