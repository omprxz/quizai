import Db from "@/utils/db";
import User from "@/models/user";
import mongoose from "mongoose";
import Quiz from "@/models/quiz";
import axios from "axios";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
import { promises as fs } from 'fs';
import path from 'path';
import { jsonrepair } from 'jsonrepair'

export const maxDuration = 60;
export const maxFiles = 2;
export const maxFileSize = 50 * 1024 * 1024;

async function fileToGenerativePart(filePath, mimeType) {
    try {
        const fileData = await fs.readFile(filePath);
        return {
            inlineData: {
                data: fileData.toString('base64'),
                mimeType
            }
        };
    } catch (error) {
        console.error('Error reading file:', error.message);
        throw error;
    }
}

async function uploadToGemini(path, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  const fileManager = new GoogleAIFileManager(apiKey);

  if (mimeType.startsWith('video/')) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });

  const file = uploadResult.file;
  console.log(file);
  return file;
}

export async function POST(req) {
    const cookieStore = cookies();
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 20000,
        responseMimeType: "application/json"
    };

    const state = { tries: 0 };

    async function generateQuiz(inputDataP, filesUsedP, filePartsP) {
        let parts = [
    {
      text: "You are an advanced AI designed to generate quiz questions based on user-provided input. Your task is to output a well-structured JSON response that includes both quiz metadata and a set of questions. Ensure your response follows the exact schema provided below and is accurate, complete, and formatted correctly.\n\n### JSON Schema for Quiz Generation:\n```json\n{\n  \"quiz\": {\n  \"meta\": {\n    \"title\": \"(Generated Title)\",\n    \"category\": \"(Generated Category)\",\n    \"description\": \"(Merged summary of provided file content and description, if any file is included. Leave empty if no file is provided.)\"\n  }\n,  \"questions\": [\n      {\n        \"question_type\": \"single_correct\",\n        \"question_text\": \"What is the capital of France?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Paris\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"London\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Berlin\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"Madrid\"\n          }\n        ],\n        \"correct_answers\": [\n          1\n        ],\n        \"reason\": \"Paris is the capital city of France, known for its rich history, culture, and landmarks like the Eiffel Tower.\"\n      },\n      {\n        \"question_type\": \"multi_correct\",\n        \"question_text\": \"Which of the following are programming languages?\",\n        \"options\": [\n          {\n            \"id\": 1,\n            \"text\": \"Python\"\n          },\n          {\n            \"id\": 2,\n            \"text\": \"HTML\"\n          },\n          {\n            \"id\": 3,\n            \"text\": \"Java\"\n          },\n          {\n            \"id\": 4,\n            \"text\": \"CSS\"\n          }\n        ],\n        \"correct_answers\": [\n          1,\n          3\n        ],\n        \"reason\": \"Python and Java are both widely-used programming languages, while HTML and CSS are primarily used for web development.\"\n      }\n    ]\n}\n}\n```\n\n### Your Responsibilities:\n1. **Quiz Generation**: Create quiz questions based on the provided input data, maintaining the correct JSON structure.\n2. **Metadata Inclusion**: Incorporate a `meta` field with:\n   - `meta.title`: A concise, relevant title based on the provided description.\n   - `meta.category`: A suitable category derived from the description.\n   - `meta.description`: A summary that combines the content of any provided files and the given description (if applicable).\n3. **Question Types**: Use `single_correct` for questions with one correct answer and `multi_correct` for questions with multiple correct answers. If the input specifies a mix of types, include both.\n4. **Reasoning**: Provide a clear and concise explanation for the correct answers in the `reason` field for each question.\n4. **Questions generation from file contents**: If any files are provided (regardless of type), analyze their content, and use its content to generate quiz. Provided files may be one or more than one. If no files provided then go with provided description. Supported file types may include, but are not limited to, text documents, images, PDFs, audio files, video files, and others.\n5. **File Handling**: If any files are provided (regardless of type), analyze their content, summarize the relevant information, and include this summary in the `meta.description`. Supported file types may include, but are not limited to, text documents, images, PDFs, audio files, video files, and others.\n6. **Accuracy**: Ensure the entire response adheres strictly to the specified JSON schema.\n\n### Input Data:\n- The quiz data will be provided in JSON format. Additionally, files of any type might be included for you to incorporate into the quiz generation.\n\n### Example Scenario:\nGiven JSON input and various types of files, output a well-structured JSON response containing the quiz questions, their corresponding correct answers with reasoning, and a complete metadata section."},]
      
    let newParts = []
    if(filesUsedP){
      newParts = [{
         text: `input: ${inputDataP}`}]
      for(const filePart of filePartsP){
        newParts.push({
      fileData: {
        mimeType: filePart.mimeType,
        fileUri: filePart.uri,
      },
    })
      }
      newParts.push({
      text: "output: "})
    }else{
     newParts = [
       {
         text: `input: ${inputDataP}`},
       {
      text: "output: "}];
    }
    parts.push(...newParts)
        const result = await model.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig,
          });
        
        return result.response.text();
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
            console.error("Tries exceeded");
            return NextResponse.json(
                {
                    message: "ERR: Tries exceeded",
                    success: false
                },
                {
                    status: 400
                }
            );
        }
    }

    try {
        const formData = await req.formData();
        const title = formData.get("title");
        const description = formData.get("description");
        const total_questions = formData.get("total_questions")
            ? parseInt(formData.get("total_questions"), 10) || 0
            : null;
        const visibility = formData.get("visibility");
        const level = formData.get("level");
        const type = formData.get("type");
        const category = formData.get("category");
        const duration = formData.get("duration")
            ? parseInt(formData.get("duration"), 10) || 0
            : null;
        const passing_score = formData.get("passing_score")
            ? parseInt(formData.get("passing_score"), 10) || 0
            : null;
        const language = formData.get("language");
        const shuffle_question = formData.get("shuffle_question") === "true";
        const shuffle_option = formData.get("shuffle_option") === "true";
        const theme = formData.get("theme");
        const files = formData.getAll("files[]");

        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { message: "AUTH ERR: No User Logged In" },
                { status: 403 }
            );
        }
        let tokenDetails;

        try {
            tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return NextResponse.json(
                {
                    message: "Authentication error: Invalid token",
                    success: false
                },
                {
                    status: 400
                }
            );
        }

        if (title && title.length > 250) {
            return NextResponse.json(
                {
                    message: "Title must not exceed 250 characters.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (description && description.length > 5000) {
            return NextResponse.json(
                {
                    message: "Description must not exceed 5000 characters.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(total_questions) ||
            total_questions < 1 ||
            total_questions > 30
        ) {
            return NextResponse.json(
                {
                    message:
                        "Number of questions must be an integer between 1 and 30.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (!level) {
            return NextResponse.json(
                { message: "Level must not be empty.", success: false },
                { status: 400 }
            );
        }

        if (!type) {
            return NextResponse.json(
                { message: "Type must not be empty.", success: false },
                { status: 400 }
            );
        }

        if (
            duration !== null &&
            duration !== undefined &&
            (duration < 30 || duration > 36000)
        ) {
            return NextResponse.json(
                {
                    message:
                        "Duration must be between 30 and 36000 seconds, or leave empty.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (
            passing_score !== null &&
            passing_score !== undefined &&
            (passing_score < 0 || passing_score > 100)
        ) {
            return NextResponse.json(
                {
                    message:
                        "Passing score must be between 0 and 100, or leave empty.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (!language) {
            return NextResponse.json(
                { message: "Language must not be empty.", success: false },
                { status: 400 }
            );
        }

        if (shuffle_question === null || shuffle_question === undefined) {
            return NextResponse.json(
                {
                    message: "Shuffle question must not be empty.",
                    success: false
                },
                { status: 400 }
            );
        }

        if (shuffle_option === null || shuffle_option === undefined) {
            return NextResponse.json(
                {
                    message: "Shuffle options must not be empty.",
                    success: false
                },
                { status: 400 }
            );
        }

        const quizMetaData = {
            description,
            total_questions: total_questions + " (MUST)",
            level,
            type,
            language
        };
        if (title) {
            quizMetaData["title"] = title;
        }
        if (category) {
            quizMetaData.category = category;
        }
        
        let filesUsed = false, fileParts =[]
        if (files) {
            if (files.length > maxFiles) {
                return NextResponse.json(
                    { message: `Max files limit is ${maxFiles}` },
                    { status: 400 }
                );
            }
            
            const uploadsDir = path.join(process.cwd(), 'tmp')
    await fs.mkdir(uploadsDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
        if (file.size > maxFileSize) {
            return NextResponse.json({ message: `Max file size limit is ${maxFileSize / (1024 * 1024)} MB` }, { status: 400 });
        }

        const filePath = path.join(uploadsDir, `${path.basename(file.name, path.extname(file.name))}-${Math.random().toString(36).substr(2, 8)}${path.extname(file.name)}`);
        await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

        savedFiles.push({ path: filePath, mimeType: file.type });
    }
    filesUsed = true
    fileParts = await Promise.all(
    savedFiles.map(file => uploadToGemini(file.path, file.mimeType))
);
        }

        const inputData = `#### Input Data For Quiz Generation:\n\n\`\`\`json${JSON.stringify(
            quizMetaData
        )}\`\`\``;
        let quizResponse
        if(filesUsed){
         quizResponse = await generateQuiz(inputData, true, fileParts);
        }else{
         quizResponse = await generateQuiz(inputData, false, []);
        }
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

        if (quizData.quiz.questions.length == 0) {
            return NextResponse.json(
                {
                    message: "No questions generated",
                    success: false
                },
                {
                    status: 400
                }
            );
        }

        const dbQuizData = {
            userid: tokenDetails.data._id,
            description,
            total_questions: quizData.quiz.questions.length || total_questions,
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
        };
        if (title) {
            dbQuizData["title"] = title;
        } else {
            dbQuizData["title"] =
                quizData?.quiz?.meta?.title || quizData?.meta?.title;
        }

        if (category) {
            dbQuizData["category"] = category;
        } else {
            dbQuizData["category"] =
                quizData?.quiz?.meta?.category || quizData?.meta?.category;
        }
        dbQuizData["description"] =
            quizData?.quiz?.meta?.description ||
            quizData?.meta?.description ||
            description;

        await Db();

        const readyQuiz = new Quiz(dbQuizData);
        try {
            const saveQuiz = await readyQuiz.save();
            return NextResponse.json({
                message: "Quiz data saved successfully",
                success: true,
                data: {
                    quizId: saveQuiz._id
                }
            });
        } catch (e) {
            return NextResponse.json(
                {
                    message: "ERR: " + e,
                    success: false
                },
                {
                    status: 400
                }
            );
        }

        return NextResponse.json(
            { message: "Request processed successfully.", success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error(error.message);
        return NextResponse.json(
            {
                message: "Server error. Please try again later.",
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    const cookieStore = cookies();
    try {
        await Db();
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    message: "No ID provided",
                    success: false
                },
                {
                    status: 400
                }
            );
        }
        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                {
                    message: "Invalid Quiz ID",
                    success: false
                },
                {
                    status: 400
                }
            );
        }

        const quizDetails = await Quiz.findById(id);
        if (quizDetails) {
            let loggedIn = false;
            let tokenDetails;
            try {
                const token = cookieStore.get("token")?.value;
                try {
                    tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
                    loggedIn = true;
                } catch (e) {}
            } catch (err) {}
            if (
                quizDetails.visibility === "public" ||
                quizDetails.userid == tokenDetails?.data?._id
            ) {
                return NextResponse.json({ quiz: quizDetails, loggedIn });
            } else {
                return NextResponse.json(
                    {
                        message: "Quiz is private",
                        success: false
                    },
                    {
                        status: 403
                    }
                );
            }
        } else {
            return NextResponse.json(
                {
                    message: "Quiz not found",
                    success: false
                },
                {
                    status: 404
                }
            );
        }
    } catch (error) {
        console.error("Server ERR:", error.message);
        return NextResponse.json(
            {
                message: "Server ERR: " + error.message,
                success: false
            },
            {
                status: 500
            }
        );
    }
}

export async function DELETE(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    message: "ID Not provided",
                    success: false
                },
                {
                    status: 404
                }
            );
        }

        if (!mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                {
                    message: "Invalid quiz ID",
                    success: false
                },
                {
                    status: 403
                }
            );
        }

        const deleteQuiz = await Quiz.deleteOne({ _id: id });
        if (deleteQuiz.deletedCount > 0) {
            return NextResponse.json(
                {
                    message: "Quiz deleted",
                    success: true
                },
                {
                    status: 200
                }
            );
        } else {
            return NextResponse.json(
                {
                    message: "No quiz deleted",
                    success: false
                },
                {
                    status: 201
                }
            );
        }
    } catch (e) {
        console.error(e.message);
        return NextResponse.json(
            { message: "Server ERR: " + e.message, success: false },
            { status: 500 }
        );
    }
}
