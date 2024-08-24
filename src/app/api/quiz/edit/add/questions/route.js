import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
import { jsonrepair } from 'jsonrepair'

export const maxDuration = 60;

export async function POST(req) {
  const cookieStore = cookies()
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:"You are an AI designed to generate new quiz questions based on the provided user input. The user will supply a JSON structure with the necessary details, and you are to respond with a JSON structure that includes new quiz questions and metadata. Ensure that the new questions do not duplicate any questions from the provided input.\n\n#### JSON Structure to Follow (Example structure for reference only; use this format for your response):\n\n```json\n{\n  \"quiz\": {\n  \"meta\": {\n    \"title\": \"(Generated Title)\",\n    \"category\": \"(Generated Category)\",\n    \"description\": \"(Merged summary of provided file content and description, if any file is included. Leave empty if no file is provided.)\"\n  }\n,  \"questions\": [\n      {\n        \"question_type\": \"single_correct\",\n        \"question_text\": \"What is the capital of France?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Paris\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"London\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Berlin\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"Madrid\"\n          }\n        ],\n        \"correct_answers\": [\n          1\n        ],\n        \"reason\": \"Paris is the capital city of France, known for its rich history, culture, and landmarks like the Eiffel Tower.\"\n      },\n      {\n        \"question_type\": \"multi_correct\",\n        \"question_text\": \"Which of the following are programming languages?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Python\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"HTML\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Java\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"CSS\"\n          }\n        ],\n        \"correct_answers\": [\n          1,\n          3\n        ],\n        \"reason\": \"Python and Java are both widely-used programming languages, while HTML and CSS are primarily used for web development.\"\n      },\n      {\n        \"question_type\": \"subjective\",\n        \"question_text\": \"What is the most significant impact of the Industrial Revolution on societal structures?\",\n        \"correct_answers\": [\n          \"The Industrial Revolution reshaped society by shifting the economy from agriculture to industry, driving urbanization as people moved to cities for factory jobs. The traditional social hierarchy, rooted in land ownership, eroded, giving rise to a new middle class of industrialists. Labor became more specialized, and as women and children entered the workforce, traditional gender roles and family dynamics changed significantly.\"\n        ],\n },\n    ]\n}\n}\n```\n\n### Your Responsibilities:\n1. **Quiz Generation**: Generate new quiz questions based on the provided input data, maintaining the correct JSON structure.\n2. Ensure that none of the new questions match any questions in the `oldQuestions` field of the input data.\n3. **Question Types**: Use `single_correct` for questions with one correct answer, `multi_correct` for questions with multiple correct answers and `subjective` for questions with subjective type answers. If the input specifies a mix of types, include all three.\n4. **Reasoning**: Provide a clear and concise explanation for the correct answers in the `reason` field for each question.\n5. **Questions generation from file contents**: If any files are provided (regardless of type), analyze their content, and use its content to generate quiz. Provided files may be one or more than one. If no files provided then go with provided description. Supported file types may include, but are not limited to, text documents, images, PDFs, audio files, video files, and others.\n6. **File Handling**: If any files are provided (regardless of type), analyze their content, summarize the relevant information, and include this summary in the `meta.description`. Supported file types may include, but are not limited to, text documents, images, PDFs, audio files, video files, and others.\n7. **Accuracy**: Ensure the entire response adheres strictly to the specified JSON schema.\n8. **Subjective Questions**: Dont't include options field in `subjective` type question and place its correct answer to the first elements of `correct_answers` array and valid reason for that correct answer to `reason` field of that respective question.\n9.Keep the number of options range from 4 to 6 (highly preferred 4) in single_correct and multi_correct type question.\n10.Total numbers of questions in quiz must be as mentioned in provided input data in `total_questions` field.\n11.Don\'t give reason for `subjective` type questions. Correct answer is enought for that.\n\n### Input Data:\n- The quiz data will be provided in JSON format. Additionally, files of any type might be included for you to incorporate into the quiz generation.\n\n### Example Scenario:\nGiven JSON input and various types of files, output a well-structured JSON response containing the quiz questions, their corresponding correct answers with reasoning, and a complete metadata section.",
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
        
        const quizResponse = await generateQuiz(inputData)
        
        let quizData
        try{
         quizData = JSON.parse(quizResponse);
        }catch(e){
          try{
         quizData = JSON.parse(jsonrepair(quizResponse))
          }catch(e){
            return NextResponse.json({
              message: 'Error creating questions'
            },
            {
              status:400
            })
          }
        }
        console.log(quizData);
        
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