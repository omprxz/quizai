# QuizAI: A Comprehensive Documentation

## 1. Introduction

### 1.1 Project URL

The QuizAI project is available online at [https://quizai-eta.vercel.app](https://quizai-eta.vercel.app).

### 1.2 Project Overview

QuizAI is a modern, web-based application designed to streamline the creation, management, and participation in quizzes. Built using cutting-edge JavaScript technologies, including Next.js, QuizAI offers a user-friendly interface and robust features suitable for educators, trainers, and anyone passionate about quizzes. This documentation provides an in-depth look at the project's architecture, features, setup, usage, and more.

### 1.3 Project Goals

- **Ease of Use:** Provide an intuitive and straightforward user experience for creating and taking quizzes.

- **AI-Powered Generation:** Leverage AI to automate quiz creation, saving time and effort.

- **Comprehensive Management:** Offer tools to efficiently manage quizzes, track user progress, and analyze results.

- **Scalability and Maintainability:** Design the application with a modular architecture for future expansion and updates.

## 2. Technology Stack

### 2.1 Core Technologies

- **Next.js:** A React framework for building server-rendered and statically generated web applications.

- **React:** A JavaScript library for building user interfaces.

- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

- **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.

- **JSON Web Tokens (JWT):** A standard for securely transmitting information between parties as a JSON object.

- **Google Generative AI:** Used for AI-powered quiz question generation.

### 2.2 Key Libraries and Tools

- **axios:** For making HTTP requests to interact with APIs.

- **react-hot-toast:** For displaying toast notifications.

- **react-icons:** For incorporating icons into the user interface.

- **react-select:** For creating customizable select dropdowns.

- **jquery-confirm:** For creating confirmation dialog boxes.

- **react-speech-recognition:** For speech-to-text functionality.

- **@vercel/analytics:** For website analytics.

## 3. Project Structure

The project follows a modular structure, primarily organized within the `src` directory.

```bash
quizai/
  ├── src/
  │    │
  │    ├── app/ # Next.js app directory
  │        │
  │        │
  │        ├── api/ # API routes
  │        │
  │        │
  │        ├── dashboard/ # Dashboard pages
  │        │        │
  │        │        │
  │        │        ├── page.js # Home page
  │        │        │
  │        │        ├── layout.js # Root layout
  │        │
  │        ├── components/ # Reusable React components
  │        │
  │        ├── models/ # Mongoose models
  │        │
  │        ├── utils/ # Utility functions
  │        │
  │        ├── styles/ # Global CSS styles
  │
  ├── public/ # Static assets
  │
  ├── README.md # Project documentation
  │
  └── ...
  ├── package.json # Project dependencies
  ├── next.config.js # Next.js configuration
  └── ...
```

### 3.1 Key Directories Explained

- **`src/app`:** This is the heart of the Next.js application. It uses the Next.js routing system.

- **`api`:** Contains API routes for handling backend logic, such as user authentication, quiz creation, and data retrieval.

- **`dashboard`:** Includes pages related to the user dashboard, such as quiz listing, creation, editing, and response viewing.

- **`src/components`:** Houses reusable React components used throughout the application. This promotes modularity and maintainability.

- **`src/models`:** Defines the Mongoose models for interacting with the MongoDB database. These models represent the structure of the data.

- **`src/utils`:** Contains utility functions, such as database connection setup and helper functions.

- **`src/styles`:** Includes global CSS files and CSS modules for styling the application.

- **`public`:** Stores static assets like images, fonts, and other files.

## 4. Database Schema

QuizAI uses MongoDB to store data. Here's a breakdown of the key Mongoose schemas:

### 4.1 User Schema

```javascript
// filepath: src/models/user.js
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    image: {
      type: String,
      default: "/user.png",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
```

name: User's full name.

email: User's email address (must be unique).

password: User's password (hashed for security).

image: URL of the user's profile image.

emailVerified: Boolean indicating if the user has verified their email.

### 4.2 Quiz Schema

```javascript
// filepath: src/models/quiz.js
const quizSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      default: "private",
    },
    title: {
      type: String,
      maxlength: 250,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: [],
      default: [],
      required: true,
    },
    level: {
      type: String,
    },
    category: {
      type: String,
    },
    duration: {
      type: Number,
      min: 30,
      max: 36000,
      default: null,
    },
    passing_score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    shuffle_question: {
      type: Boolean,
      required: true,
    },
    shuffle_option: {
      type: Boolean,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    total_questions: {
      type: Number,
      min: 1,
      max: 50,
      required: true,
    },
    theme: {
      type: String,
      required: true,
      default: "autumn",
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);
```

userid: ID of the user who created the quiz.

visibility: Whether the quiz is public or private.

title: Title of the quiz.

description: Description of the quiz topic.

type: Array of question types included in the quiz.

level: Difficulty level of the quiz.

category: Category the quiz belongs to.

duration: Time limit for the quiz (in seconds).

passing_score: Minimum score required to pass the quiz.

shuffle_question: Whether to shuffle the order of questions.

shuffle_option: Whether to shuffle the order of options within each question.

language: Language of the quiz.

total_questions: Total number of questions in the quiz.

theme: Theme applied to the quiz interface.

questions: An array of questionSchema objects.

### 4.3 Question Schema

```js
const questionSchema = new mongoose.Schema({
  question_type: {
    type: String,
    required: true,
  },
  question_text: {
    type: String,
  },
  options: {
    type: [optionSchema],
    default: [],
  },
  correct_answers: [
    {
      type: mongoose.Schema.Types.Mixed,
    },
  ],
  reason: {
    type: String,
  },
});
```

question_type: Type of question (e.g., single_correct, multi_correct, subjective).

question_text: Text of the question.

options: An array of optionSchema objects (for multiple-choice questions).

correct_answers: An array of correct answer IDs.

reason: Explanation for the correct answer.

### 4.4 Option Schema

```js
const optionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
  },
});
```

id: Unique identifier for the option.

text: Text of the option.

## 5. API Endpoints

QuizAI provides a set of RESTful API endpoints for various functionalities.

### 5.1 User Authentication

POST /api/register: Registers a new user.

POST /api/login: Logs in an existing user.

GET /api/user: Retrieves the current user's information.

POST /api/logout: Logs out the current user.

POST /api/password/[action]: Handles password reset requests and changes.

### 5.2 Quiz Management

POST /api/quiz: Creates a new quiz.

GET /api/quiz: Retrieves quiz details or a list of quizzes.

PATCH /api/quiz/patch/visibility: Updates the visibility of a quiz.

DELETE /api/quiz: Deletes a quiz.

POST /api/quiz/edit/add/questions: Adds new questions to an existing quiz using AI.

### 5.3 User Data

GET /api/user/public/[id]: Retrieves public information about a user, including their quizzes and responses.

### 5.4 Example API Call (Create Quiz)

```js
// filepath: src/app/dashboard/quiz/create/page.js
const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true);
  try {
    const { total_questions, duration, passing_score, description, useFile } =
      formData;

    if (!description) {
      showToast.error("Quiz description is required for creating quizzes.");
      setLoading(false);
      return;
    }

    const processedData = {
      ...formData,
      files: useFile ? formData.files : [],
    };

    const form = new FormData();
    for (const key in processedData) {
      if (key === "files" && processedData[key].length > 0) {
        processedData[key].forEach((file) => form.append("files[]", file));
      } else if (Array.isArray(processedData[key])) {
        processedData[key].forEach((item) => form.append(`type[]`, item));
      } else {
        form.append(key, processedData[key]);
      }
    }

    const response = await axios.post("/api/quiz", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      $.confirm({
        title: "Success",
        content: `<p style="padding: 10px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;" class="form-control">${
          response?.data?.message || "Quiz created"
        }</p>`,
        buttons: {
          edit: {
            text: "Edit",
            btnClass: "px-2",
            action: function () {
              router.push(
                "/dashboard/quiz/" + response.data.data.quizId + "/edit"
              );
            },
          },
          view: {
            text: "View",
            btnClass: "px-2",
            action: function () {
              router.push(
                "/dashboard/quiz/" + response.data.data.quizId + "/view"
              );
            },
          },
          home: {
            text: "Home",
            btnClass: "px-2",
            action: function () {
              router.push("/dashboard");
            },
          },
        },
        useBootstrap: true,
        theme: "supervan",
      });
    }
  } catch (error) {
    console.error("Quiz creation error:", error);
    showToast.error(error.response?.data?.message || "Failed to create quiz");
  } finally {
    setLoading(false);
  }
};
```

## 6. Key Features

### 6.1 User Authentication

QuizAI implements a secure user authentication system using JWT.

```js
// filepath: src/app/api/register/route.js
export async function POST(req) {
  try {
    await Db();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed", success: false },
      { status: 500 }
    );
  }
}
```

### 6.2 Quiz Creation

Users can create quizzes with various settings, including:

`Title and description`
`Visibility (public or private)`
`Difficulty level`
`Category`
`Duration`
`Passing score`
`Shuffle questions/options`
`Language`
`Theme`

### 6.3 AI-Powered Question Generation

QuizAI leverages the Google Generative AI to automatically generate quiz questions based on a given topic.

````js
// filepath: src/app/api/quiz/route.js
async function generateQuiz(
  inputDataP,
  modelToUse = "gemini-2.0-flash",

  filesP = null
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelToUse,
    safetySettings: [
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_UNSAFE_CONTENT",
        threshold: "BLOCK_NONE",
      },
    ],
  });

  const generationConfig = {
    temperature: Math.random() * (1.65 - 1.4) + 1.4,

    topP: 0.95,

    topK: 64,
    maxOutputTokens: 20000,
    responseMimeType: "application/json",
  };

  let parts = [
    {
      text: 'You are an advanced AI designed to generate quiz questions based on user-provided input. Your task is to output a well-structured JSON response that includes both quiz metadata and a set of questions. Ensure your response follows the exact schema provided below and is accurate, complete, and formatted correctly.\n\n### JSON Schema for Quiz Generation:\n```json\n{\n  "quiz": {\n  "meta": {\n    "title": "(Generated Title)",\n    "category": "(Generated Category)",\n    "description": "(Merged summary of provided file content and description, if any file is included. Leave empty if no file is provided.)"\n  }\n,  "questions": [\n      {\n        "question_type": "single_correct",\n        "question_text": "What is the capital of France?",\n        "options": [\n          {\n            "id": 1,\n            "text": "Paris"\n          },\n          {\n            "id": 2,\n            "text": "Berlin"\n          },\n          {\n            "id": 3,\n            "text": "Madrid"\n          },\n          {\n            "id": 4,\n            "text": "Rome"\n          }\n        ],\n        "correct_answers": [\n          1\n        ],\n        "reason": "Paris is the capital city of France, known for its rich history and culture."\n      },\n      {\n        "question_type": "multi_correct",\n        "question_text": "Which of the following are primary colors?",\n        "options": [\n          {\n            "id": 1,\n            "text": "Red"\n          },\n          {\n            "id": 2,\n            "text": "Green"\n          },\n          {\n            "id": 3,\n            "text": "Blue"\n          },\n          {\n            "id": 4,\n            "text": "Yellow"\n          }\n        ],\n        "correct_answers": [\n          1,\n          3,\n          4\n        ],\n        "reason": "Red, blue, and yellow are the primary colors that can be combined to create other colors."\n      },\n{\n        "question_type": "subjective",\n        "question_text": "Explain the theory of relativity in brief.",\n        "options": [],\n        "correct_answers": [],\n        "reason": "The theory of relativity, developed by Albert Einstein, includes two main theories: special relativity and general relativity. Special relativity deals with the structure of spacetime and the relationship between energy and mass, expressed by the famous equation E=mc^2. General relativity extends this to include gravity as a curvature of spacetime caused by mass and energy."\n      }\n    ]\n  }\n}\n```',
    },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });
    return result.response.text();
  } catch (error) {
    console.log(error);
    if (error?.status == 429 || error?.status == 500) {
      generateQuiz(inputDataP, "gemini-2.0-flash");
    } else if (error?.status == 503) {
      generateQuiz(inputDataP, "gemini-1.5-flash");
    } else {
      return NextResponse.json(
        {
          message: "Error generating questions",
          success: false,
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }
  }
}
````

### 6.4 Quiz Participation

Users can take quizzes and receive immediate feedback on their performance.

### 6.5 Result Summary and Detailed View

QuizAI provides a result summary with the score, percentage, and a link to view a detailed breakdown of the answers.

```jsx
// filepath: src/app/dashboard/quiz/[quizid]/view/page.js
<dialog id="result_summary" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Result</h3>
    <div dangerouslySetInnerHTML={{ __html: resultContent }} />
    <div className="modal-action mx-auto flex justify-center items-center">
      <Link href={`/dashboard/quiz/response/${responseId}`} className="btn btn-primary">
        <FaClipboardCheck /> View Detailed Result
      </Link>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

### 6.6 Responsive Design

The application is designed to be responsive and accessible on various devices.

### 6.7 Theme Customization
Users can select from a variety of themes to customize the look and feel of the application.

## 7. Installation and Setup

### 7.1 Prerequisites
`Node.js (version 18 or higher)`\
`npm or yarn package manager`\
`MongoDB database`\
`Google Generative AI API key`

### 7.2 Steps to Set Up the Project
1. Clone the repository:
git clone https://github.com/omprxz/quizai.git
cd quizai

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a .env.local file in the project root and add the following variables:

MONGODB_URI=<your_mongodb_connection_string>\
JWT_SECRET=<your_jwt_secret>\
GEMINI_API_KEY=<your_gemini_api_key>\
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your deployed URL

4. Run the development server:
```bash
npm run dev
```

1. Open your browser and navigate to http://localhost:3000 to see the application running.

2. Usage Instructions

### 8.1 Running the Application
After setting up the project and starting the development server, the application can be accessed at http://localhost:3000.

### 8.2 User Authentication
Users can register, log in, and manage their accounts via the provided authentication pages.

### 8.3 Creating and Managing Quizzes
Once logged in, users can create new quizzes through the dashboard.
The dashboard allows users to view, edit, and manage existing quizzes, as well as to see quiz responses.\
Quizzes can be edited and deleted as needed, and responses to quizzes can be reviewed individually.

## 9. Code Snippets

### 9.1 Database Connection
```js
// filepath: src/utils/db.js
import mongoose from 'mongoose';

const Db = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('DB connected');
    }
  } catch (error) {
    console.error('DB connection error:', error);
  }
};

export default Db;
```

### 9.2 JWT Verification
```js
// filepath: src/app/api/quiz/route.js
import jwt from "jsonwebtoken";
export async function POST(req) {
    const cookieStore = cookies()
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
          success: false,
        },
        {
          status: 400,
        }
      );
    }
}
```

### 9.3 Theme Handling
```js
// filepath: src/components/Header.js
  useEffect(() => {
    localStorage.setItem('theme', theme)
    const localTheme = localStorage.getItem('theme')
    if(localTheme){
    document.querySelector('html').setAttribute('data-theme', localTheme)
    }
  }, [theme])
```
  
## 10. Challenges and Solutions

### 10.1 AI Question Generation
Challenge: Ensuring the AI generates relevant, accurate, and diverse questions.\
Solution: Fine-tuning the prompt provided to the Google Generative AI and implementing error handling to retry or adjust the generation process.

### 10.2 Security
Challenge: Protecting user data and preventing unauthorized access.\
Solution: Implementing JWT for authentication, hashing passwords, and sanitizing user inputs.

### 10.3 Performance
Challenge: Optimizing the application for speed and responsiveness.\
Solution: Using Next.js for server-side rendering, optimizing database queries, and caching data where appropriate.

## 11. Future Enhancements
Advanced Analytics: Implement more detailed analytics to track quiz performance and user engagement.\
Integration with Learning Management Systems (LMS): Allow seamless integration with popular LMS platforms.\
Gamification: Add gamification elements to enhance user engagement and motivation.\
More AI Features: Explore additional AI capabilities, such as automated quiz grading and personalized learning recommendations.

## 12. Conclusion
QuizAI represents a significant step forward in quiz creation and management. By combining a user-friendly interface with powerful AI capabilities, QuizAI empowers educators and learners alike. This project demonstrates a strong understanding of modern web development technologies and a commitment to creating innovative solutions.

## 13. References
Next.js Documentation: https://nextjs.org/docs\
React Documentation: https://react.dev/\
Tailwind CSS Documentation: https://tailwindcss.com/docs\
Mongoose Documentation: https://mongoosejs.com/docs/\
Google Generative AI: https://ai.google.dev/\

## 14. Acknowledgments
We would like to thank all the contributors who have helped in the development of this project.