"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline, MdOutlineSportsScore, MdVisibility } from "react-icons/md";
import { LuTimer } from "react-icons/lu";
import { FaRankingStar } from "react-icons/fa6";
import { FaTimes, FaCheck } from "react-icons/fa";

export default function Page({ params }) {
  const router = useRouter();

  const [responseDetails, setResponseDetails] = useState({});
  const [dataStatus, setDataStatus] = useState(0);
  const [dataMsg, setDataMsg] = useState('Loading result data, please hold on...');

  useEffect(() => {
    const fetchResponseDetails = async () => {
      try {
        const responseDetails = await axios.get('/api/quiz/response?id=' + params.id);
        setDataStatus(1);
        setResponseDetails(responseDetails.data);
      } catch (error) {
        setDataStatus(-1);
        setDataMsg(error.response?.data?.message || error.message);
      }
    };

    fetchResponseDetails();
  }, [params.id]);

  const formatTime = (timeInSeconds) => {
    if (timeInSeconds >= 3600) {
      return `${Math.floor(timeInSeconds / 3600)}h ${Math.floor((timeInSeconds % 3600) / 60)}m ${timeInSeconds % 60}s`;
    } else if (timeInSeconds >= 60) {
      return `${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s`;
    } else {
      return `${timeInSeconds}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-4 px-4">
      {responseDetails._id ? (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-blue-500 dark:text-blue-400 text-center mb-6">Result Details</h1>

          {/* Submission and Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-md p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Submitted on:</span>{' '}
                {new Date(responseDetails.createdAt).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }).replace(',', '')}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Submitted by:</span>{' '}
                {responseDetails.username}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Quiz Title:</span>{' '}
                {responseDetails.quiz ? (
                  <Link href={`/dashboard/quiz/${responseDetails.quizDetails._id}/view`} className="text-blue-500 dark:text-blue-400 hover:underline">
                    {responseDetails.quizDetails.title}
                  </Link>
                ) : (
                  responseDetails.quizDetails.title
                )}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Total Questions:</span>{' '}
                {responseDetails.total_questions}
              </p>
              {responseDetails.quizDetails.passing_score !== null && <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Passing Score:</span>{' '}
                  {responseDetails.quizDetails.passing_score == 0 ? 0 : responseDetails.quizDetails.passing_score.toFixed(2)}%
                </p>
              }
            </div>
          </div>

          <div className='w-full flex justify-center my-6'>
            <div className="alert dark:bg-gray-700 dark:border-gray-600 shadow-md w-full max-w-sm md:max-w-xs md:py-4 flex flex-col gap-y-1 md:gap-y-2 justify-center items-center">
              <p className="text-gray-600 dark:text-gray-200 font-bold text-xl">
                {`${responseDetails.rank}/${responseDetails.quizResponsesCount}`}
              </p>
              <FaRankingStar className='text-5xl dark:text-gray-400' />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="flex flex-col justify-center items-center gap-4 mb-6">
            <div className="flex justify-center gap-4">
              <div className="alert alert-success shadow-md">
                <span className="text-2xl font-bold">{responseDetails.correct}</span>
                <span className="text-sm font-medium">Correct</span>
              </div>
              <div className="alert alert-error shadow-md">
                <span className="text-2xl font-bold">{responseDetails.wrong}</span>
                <span className="text-sm font-medium">Wrong</span>
              </div>
              <div className="alert alert-warning shadow-md">
                <span className="text-2xl font-bold">{responseDetails.notAttempted}</span>
                <span className="text-sm font-medium">Skipped</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <div className="alert alert-success shadow-md">
                <span className="text-xl font-bold">{responseDetails.percentage.toFixed(2)}%</span>
                <MdOutlineSportsScore className='text-3xl' />
              </div>
              <div className="alert alert-warning shadow-md px-7 md:px-1">
                <span className="text-xl font-bold">
                  {formatTime(responseDetails.timeTaken)}
                </span>
                <LuTimer className='text-3xl' />
              </div>
            </div>
            {responseDetails.quizDetails.passing_score !== null && <div className={`alert ${responseDetails.percentage >= responseDetails.quizDetails.passing_score ? 'alert-success' : 'alert-error'} shadow-md text-gray-200 w-2/3 md:w-auto md:px-5 md:mx-auto y-1 flex md:flex-row flex-col justify-center items-center`}>
              <span className={`text-2xl font-bold`}>
                {responseDetails.percentage >= responseDetails.quizDetails.passing_score ? "Passed" : "Failed"}
              </span>
              {responseDetails.percentage >= responseDetails.quizDetails.passing_score ? (<FaCheck className="text-3xl" />) : (<FaTimes className="text-3xl" />)}
            </div>
            }
          </div>

          {/* Answers Summary */}
          {responseDetails.quizDetails.questions && (
  <div className="w-full">
    <div className="collapse collapse-arrow join-item border-base-300 border rounded-md">
      <input type="checkbox" name="my-accordion-4" />
      <div className="collapse-title text-xl font-medium dark:text-gray-200">
        View your answers <MdVisibility className='inline' />
      </div>
      <div className="collapse-content">
        {responseDetails.quizDetails.createdAt !== responseDetails.quizDetails.updatedAt && (
          <p className='text-sm mb-3'>
            Some questions may display different details in &quot;View your answers&quot; because they might have been modified.
          </p>
        )}
        <div className="flex flex-col justify-center items-center gap-y-3 text-xs">
          {responseDetails.quizDetails.questions.map((question, index) => {
            const userAnswers = responseDetails.selectedAnswers[question._id] || [];
            const allCorrect = question.correct_answers.length === userAnswers.length &&
              question.correct_answers.every(ans => userAnswers.includes(ans));
            const isSkipped = userAnswers.length === 0;
            const bgColor = question.question_type !== 'subjective' ? (
              isSkipped ? 'border-yellow-500 shadow-yellow-300 bg-yellow-100' :
              allCorrect ? 'border-green-500 shadow-green-300 bg-green-100' :
              'border-red-500 shadow-red-300 bg-red-100 dark:bg-red-200 dark:text-neutral'
            ) : '';

            return (
              <div
                key={question._id}
                className={`rounded-md py-4 w-full border shadow px-3 ${bgColor}`}
              >
                <p className="font-bold text-sm">{index + 1}. {question.question_text}</p>
                <div className="flex flex-col justify-center items-start gap-4 mt-3">
                  {question.question_type !== 'subjective' ? (
                    question.options.map((option) => (
                      <label
                        key={option.id}
                        className={`${question.correct_answers.includes(option.id) ? 'text-green-500' : ''} flex flex-row whitespace-break-spaces justify-start items-center gap-2`}
                      >
                        <input
                          type={question.question_type === 'single_correct' ? 'radio' : 'checkbox'}
                          name={question._id}
                          value={option.id}
                          disabled={true}
                          checked={userAnswers.includes(option.id)}
                        /> {option.text}
                      </label>
                    ))
                  ) : (
                    <>
                      <textarea
                        className="textarea textarea-bordered w-full bg-gray-100 dark:bg-gray-700 text-sm md:text-base p-2 h-24"
                        placeholder="Not attempted"
                        disabled
                        value={userAnswers.join(', ')}
                      ></textarea>
                      {question.correct_answers[0] && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-green-500">
                          Correct Answer: {question.correct_answers[0]}
                        </p>
                      )}
                    </>
                  )}
                  {question.reason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reason: {question.reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}

          {/* Retake Button */}
          {responseDetails.quiz && (
            <div className="mt-6 text-center">
              <Link href={`/dashboard/quiz/${responseDetails.quizDetails._id}/view`} className="btn btn-primary">
                Give Quiz Again
              </Link>
            </div>
          )}
        </div>
      ) : (
        dataStatus === 0 ? (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="alert alert-info shadow-lg max-w-md w-full mx-4">
              <RiLoader2Fill className="animate-spin mr-3 text-2xl" />
              <span className="text-sm">{dataMsg}</span>
            </div>
          </div>
        ) : dataStatus === -1 ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="alert alert-error shadow-lg max-w-md w-full mx-4">
              <MdErrorOutline className="text-2xl mr-3" />
              <span>{dataMsg}</span>
            </div>
            <div className="mt-4 text-center">
              <Link href="/" className="btn btn-link">
                Explore QuizAI
              </Link>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}