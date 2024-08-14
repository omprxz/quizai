import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

export const maxDuration = 60;

export async function POST(req) {
  const cookieStore = cookies()
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are an AI designed to generate new quiz questions based on the provided user input. The user will supply a JSON structure with the necessary details, and you are to respond with a JSON structure that includes new quiz questions and metadata. Ensure that the new questions do not duplicate any questions from the provided input.\n\n#### JSON Structure to Follow (Example structure for reference only; use this format for your response):\n\n```json\n{\n  \"quiz\": {\n    \"questions\": [\n      {\n        \"question_type\": \"single_correct\",\n        \"question_text\": \"What is the capital of France?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Paris\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"London\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Berlin\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"Madrid\"\n          }\n        ],\n        \"correct_answers\": [\n          1\n        ],\n        \"reason\": \"Paris is the capital of France, as established by French law.\"\n      },\n      {\n        \"question_type\": \"multi_correct\",\n        \"question_text\": \"Which of the following are programming languages?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Python\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"HTML\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Java\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"CSS\"\n          }\n        ],\n        \"correct_answers\": [\n          1,\n          3\n        ],\n        \"reason\": \"Python and Java are programming languages. HTML and CSS are markup and style sheet languages, respectively.\"\n      }\n    ]\n  }\n}\n```\n\n### Task:\n1. Generate new quiz questions based on the provided user input.\n2. Ensure that none of the new questions match any questions in the `oldQuestions` field of the input data.\n3. Follow the schema structure exactly.\n4. Use `single_correct` or `multi_correct` for `question_type` in the questions.\n5. If the input specifies mixed types, include both `single_correct` and `multi_correct` questions.\n6. Provide the input data for quiz generation in JSON format.",
});
  const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 20000,
  responseMimeType: "application/json",
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
        const token = cookieStore.get('token')?.value
        if(!token){
          return NextResponse.json({
            message: 'Authentication error: No token',
            success:false
          },{
              status:400
            })
        }
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
             description, total_questions, level, type, language, oldQuestions 
        } = body;

        if (description && description.length > 5000) {
            return NextResponse.json({ message: "Description must not exceed 5000 characters.", success: false }, { status: 400 });
        }

        if (!Number.isInteger(total_questions) || total_questions < 1 || total_questions > 30) {
            return NextResponse.json({ message: "Number of questions must be an integer between 1 and 30.", success: false }, { status: 400 });
        }

        if (!level) {
            return NextResponse.json({ message: "Level must not be empty.", success: false }, { status: 400 });
        }

        if (!type) {
            return NextResponse.json({ message: "Type must not be empty.", success: false }, { status: 400 });
        }

        if (!language) {
            return NextResponse.json({ message: "Language must not be empty.", success: false }, { status: 400 });
        }

        const quizMetaData = {
          description,
          total_questions: total_questions + ' (MUST)',
          level,
          type,
          language,
          oldQuestions: oldQuestions + '(Please must not include these questions.)'
        }
        
        const inputData = `#### Input Data For Quiz Generation:\n\n\`\`\`json${JSON.stringify(quizMetaData)}\`\`\``
        //console.log(inputData)
        const quizResponse = await generateQuiz(inputData)
        
        //const quizData = await extractJson(inputData, quizResponse)
        const quizData = JSON.parse(quizResponse)
        console.log(quizData.quiz.questions)
        
        if(quizData.quiz.questions.length == 0){
          return NextResponse.json({
            message: 'No questions generated',
            success: false
          }, {
            status: 400
          })
        }

return NextResponse.json({
    message: 'Questions generated',
    success:true,
    questions: quizData.quiz.questions
  })
    } catch (error) {
      console.log(error)
        return NextResponse.json({ message: "Server error. Please try again later.", success: false, error: error.message }, { status: 500 });
    }
}