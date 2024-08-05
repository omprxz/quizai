import Db from "@/utils/db";
import User from "@/models/user";
import mongoose from 'mongoose'
import Quiz from "@/models/quiz";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");


export async function POST(req) {
  const cookieStore = cookies()
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are an AI designed to generate quiz questions based on the given user input. The user will provide a JSON structure with the necessary details, and you are to respond with a complete quiz JSON structure that includes the quiz metadata and questions. Follow the schema structure provided and ensure your response is properly formatted.\n\n#### JSON Structure to Follow (Given questions, options and correct answers are just an example just follow the structure not the data of this example structure):\n\n```json\n{\n  \"quiz\": {\n    \"questions\": [\n      {\n        \"question_type\": \"single_correct\",\n        \"question_text\": \"What is the capital of France?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Paris\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"London\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Berlin\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"Madrid\"\n          }\n        ],\n        \"correct_answers\": [\n          1\n        ]\n      },\n      {\n        \"question_type\": \"multi_correct\",\n        \"question_text\": \"Which of the following are programming languages?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Python\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"HTML\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Java\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"CSS\"\n          }\n        ],\n        \"correct_answers\": [\n          1,\n          3\n        ],\n\"reason\": (Concise but well informative reason for correct answers. keep it in single para if possible not in list)\n      }\n    ],\n    \"meta\": {\n      \"title\": \"(Suggested Title)\",\n      \"category\": \"(Suggested Category)\"\n    }\n  }\n}\n```\n\n### Task:\n1. Generate quiz questions based on the provided user input.\n2. Include a `meta` field in the JSON response.\n3. In `meta.title`, include a suggested short title derived from the given description.\n4. In `meta.category`, include a suggested category derived from the given description.\n5. Ensure the response follows the schema structure exactly.\n6. Use `single_correct` or `multi_correct` for `question_type` in the questions.\n7. If 'type' is mixed then include single_correct and multi_correct both type of questions\n8. Input Data For Quiz Generation Given below in json format",
});
  const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
  
  const state = { tries: 0 };

  async function generateQuiz(inputData) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage(inputData);
  return result.response.text()
}

  async function extractJson(inputData, jsonResponse) {
    if (state.tries < 3) {
        state.tries++;
        const jsonRegEx = /\`\`\`json([\s\S]*?)\`\`\`/g;
        const matchedJson = jsonRegEx.exec(jsonResponse);
        if (matchedJson) {
            return JSON.parse(matchedJson[1]);
        } else {
            const retryJsonResponse = await generateQuiz(inputData);
            return extractJson(inputData, retryJsonResponse);
        }
    } else {
        console.log("Tries exceeded");
        return NextResponse.json({
          message:'ERR: Tries exceeded',
          success:false
        },{
          status:400
          })
    }
}

    try {
        const body = await req.json();
        const token = cookieStore.get('token').value
        let tokenDetails
        try{
          tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
        }catch(e){
          return NextResponse.json({
            message: 'Authentication error: Inavlid token',
            success:false
          },{
              status:400
            })
        }
        
        const { 
            title, description, total_questions, visibility, level, type, category, duration, 
            passing_score, language, shuffle_question, shuffle_option, theme 
        } = body;

        if (title && title.length > 250) {
            return NextResponse.json({ message: "Title must not exceed 250 characters.", success: false }, { status: 400 });
        }

        if (description && description.length > 1000) {
            return NextResponse.json({ message: "Description must not exceed 1000 characters.", success: false }, { status: 400 });
        }

        if (!Number.isInteger(total_questions) || total_questions < 1 || total_questions > 50) {
            return NextResponse.json({ message: "Number of questions must be an integer between 1 and 50.", success: false }, { status: 400 });
        }

        if (!level) {
            return NextResponse.json({ message: "Level must not be empty.", success: false }, { status: 400 });
        }

        if (!type) {
            return NextResponse.json({ message: "Type must not be empty.", success: false }, { status: 400 });
        }

        if (duration !== null && duration !== undefined && (duration < 30 || duration > 36000)) {
            return NextResponse.json({ message: "Duration must be between 30 and 36000 seconds, or leave empty.", success: false }, { status: 400 });
        }

        if (passing_score !== null && passing_score !== undefined && (passing_score < 0 || passing_score > 100)) {
            return NextResponse.json({ message: "Passing score must be between 0 and 100, or leave empty.", success: false }, { status: 400 });
        }

        if (!language) {
            return NextResponse.json({ message: "Language must not be empty.", success: false }, { status: 400 });
        }

        if (shuffle_question === null || shuffle_question === undefined) {
            return NextResponse.json({ message: "Shuffle question must not be empty.", success: false }, { status: 400 });
        }

        if (shuffle_option === null || shuffle_option === undefined) {
            return NextResponse.json({ message: "Shuffle options must not be empty.", success: false }, { status: 400 });
        }
        
        
        const quizMetaData = {
          description,
          total_questions,
          level,
          type,
          language
        }
        if(title){
          quizMetaData['title'] = title
        }
        if(category){
          quizMetaData.category = category
        }
        
        const inputData = `#### Input Data For Quiz Generation:\n\n\`\`\`json${JSON.stringify(quizMetaData)}\`\`\``
        
        const quizResponse = await generateQuiz(inputData)
        
        const quizData = await extractJson(inputData, quizResponse)
        
        if(quizData.quiz.questions.length == 0){
          return NextResponse.json({
            message: 'No questions generated',
            success: false
          }, {
            status: 400
          })
        }
        
        const dbQuizData = {
  userid: tokenDetails.data._id,
	description,
	total_questions,
	visibility,
	level,
	type,
	duration,
	passing_score,
	language,
	shuffle_question,
	shuffle_option,
	theme,
	questions: quizData.quiz.questions
}
if(title){
  dbQuizData['title'] = title
}else{
  dbQuizData['title'] = quizData.quiz.meta['title']
}

if(category){
  dbQuizData['category'] = category
}else{
  dbQuizData['category'] = quizData.quiz.meta['category']
}

await Db();

const readyQuiz = new Quiz(dbQuizData)
try{
const saveQuiz = await readyQuiz.save()
return NextResponse.json({
    message: 'Quiz data saved successfully',
    success:true,
    data: {
      quizId: saveQuiz._id
    }
  })
}catch(e){
  return NextResponse.json({
    message: 'ERR: '+e,
    success:false
  }, {
    status:400
  })
}

        return NextResponse.json({ message: "Request processed successfully.", success: true }, { status: 200 });
    } catch (error) {
      console.log(error)
        return NextResponse.json({ message: "Server error. Please try again later.", success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
  const cookieStore = cookies()
  try {
    await Db();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
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

    const quizDetails = await Quiz.findById(id);
    if (quizDetails) {
       let loggedIn = false;
       let tokenDetails
          try{
            const token = cookieStore.get('token').value
            try{
               tokenDetails = jwt.verify(token, process.env.JWT_SECRET)
              loggedIn=true
            }catch(e){}
          }catch(err){}
      if (quizDetails.visibility === 'public' || quizDetails.userid == tokenDetails.data._id) {
          return NextResponse.json({quiz:quizDetails, loggedIn});
      } else {
        
        return NextResponse.json({
          message: 'Quiz is private',
          success: false
        }, {
          status: 403
        });
      }
    } else {
      return NextResponse.json({
        message: 'Quiz not found',
        success: false
      }, {
        status: 404
      });
    }
  } catch (error) {
    console.log('Server ERR:',error)
    return NextResponse.json({
      message: 'Server error',
      success: false
    }, {
      status: 500
    });
  }
}

export async function DELETE(req) {
  try{
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  
  if(!id){
    return NextResponse.json({
      message: 'ID Not provided',
      success: false
    }, {
      status: 404
      })
  }
  
  if(!mongoose.isValidObjectId(id)){
    return NextResponse.json({
      message: 'Invalid quiz ID',
      success: false
    }, {
      status: 403
      })
  }
  
  const deleteQuiz = await Quiz.deleteOne({_id: id})
  console.log(deleteQuiz)
  if(deleteQuiz.deletedCount > 0){
    return NextResponse.json({
      message: 'Quiz deleted',
      success: true
    }, {
      status: 200})
  }else{
    return NextResponse.json({
      message: 'No quiz deleted',
      success: false
    }, {
      status: 201 })
  }
  }catch(e){
    console.log(e)
    return NextResponse.json({message: 'Server ERR: '+e.message, success: false}, {status: 500})
  }
  
}
