"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";

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
    <>
      {responseDetails._id ? (
        <div className="min-h-screen p-4 bg-gray-100">
          <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold text-blue-500">Result Details</h1>
            <div className="divider my-4 bg-gray-300"></div>

            {/* Submission Info */}
            <div className="bg-blue-50 rounded-md p-4 mb-4">
              <p className="text-gray-600">
                Submitted on: <span className="font-medium">{new Date(responseDetails.createdAt).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }).replace(',', '')}</span>
              </p>
              <p className="text-gray-600">
                Submitted by: <span className="font-medium">{responseDetails.username}</span>
              </p>
            </div>

            {/* Quiz Info */}
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <p className="text-gray-600">
                Quiz Title:{" "}
                {responseDetails.quiz ? (
                  <Link href={`/quiz/${responseDetails.quizId}/view`} className="text-blue-500 hover:underline">
                    {responseDetails.quizTitle}
                  </Link>
                ) : (
                  responseDetails.quizTitle
                )}
              </p>
              <p className="text-gray-600">
                Total Questions: <span className="font-medium">{responseDetails.total_questions}</span>
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="alert alert-success shadow-md">
                <span className="text-xl font-bold">{responseDetails.correct}</span>
                <span className="text-sm font-medium ml-2">Correct</span>
              </div>
              <div className="alert alert-error shadow-md">
                <span className="text-xl font-bold">{responseDetails.wrong}</span>
                <span className="text-sm font-medium ml-2">Wrong</span>
              </div>
              <div className="alert alert-warning shadow-md">
                <span className="text-xl font-bold">{responseDetails.notAttempted}</span>
                <span className="text-sm font-medium ml-2">Not Attempted</span>
              </div>
              {responseDetails.quizPassing_score && (
                <div className="alert alert-info shadow-md">
                  <span className="text-xl font-bold">{responseDetails.percentage.toFixed(2)}%</span>
                  <span className="text-sm font-medium ml-2">Scored</span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {responseDetails.quizPassing_score && (
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <p className="text-gray-600">
                  Passing Score: <span className="font-medium">{responseDetails.quizPassing_score.toFixed(2)}%</span>
                </p>
                <p className="text-gray-600">
                  Rank: <span className="font-medium">{`${responseDetails.rank}/${responseDetails.quizResponsesCount}`}</span>
                </p>
                <p className="text-gray-600">
                  Result:{" "}
                  <span className={responseDetails.percentage >= responseDetails.quizPassing_score ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {responseDetails.percentage >= responseDetails.quizPassing_score ? "Passed" : "Failed"}
                  </span>
                </p>
                <p className="text-gray-600">
                  Time Taken: <span className="font-medium">{formatTime(responseDetails.timeTaken)}</span>
                </p>
              </div>
            )}

            {/* Retake Button */}
            {responseDetails.quiz && (
              <div className="mt-6 text-center">
                <Link href={`/quiz/${responseDetails.quizId}/view`} className="btn btn-primary">
                  Give Quiz Again
                </Link>
              </div>
            )}
          </div>
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
    </>
  );
}