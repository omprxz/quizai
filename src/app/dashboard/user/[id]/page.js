"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const formatTime = (timeInSeconds) => {
  if (timeInSeconds >= 3600) {
    return `${Math.floor(timeInSeconds / 3600)}h ${Math.floor((timeInSeconds % 3600) / 60)}m ${timeInSeconds % 60}s`;
  } else if (timeInSeconds >= 60) {
    return `${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s`;
  } else {
    return `${timeInSeconds}s`;
  }
};

export default function UserProfile() {
  const theme = useTheme();
  const params = useParams();
  const { id } = params;
  
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('responses');

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    axios.get(`/api/user/public/${id}`)
      .then(res => {
        if (res.data.success) {
          setUserData(res.data.data);
          setError(null);
        } else {
          setError(res.data.message || 'Failed to load user data');
        }
      })
      .catch(err => {
        console.error(err);
        setError(err?.response?.data?.message || 'An error occurred while fetching user data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="alert alert-warning max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>User not found or data unavailable.</span>
        </div>
      </div>
    );
  }

  const { user, quizzes, responses, stats } = userData;
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Header */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img 
                  src={user.image || "/user.png"} 
                  alt={user.name} 
                  className="object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/user.png";
                  }}
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Joined on {joinDate}</p>
              <div className="stats stats-vertical md:stats-horizontal shadow mt-4">
                <div className="stat">
                  <div className="stat-title">Quizzes Created</div>
                  <div className="stat-value text-primary">{stats.totalQuizzes}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Quiz Responses</div>
                  <div className="stat-value text-secondary">{stats.totalResponses}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Avg. Score</div>
                  <div className="stat-value">{stats.avgScore.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 justify-center">
        <a 
          className={`tab ${activeTab === 'responses' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Responses
        </a>
        <a 
          className={`tab ${activeTab === 'quizzes' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          Created Quizzes
        </a>
        <a 
          className={`tab ${activeTab === 'statistics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </a>
      </div>

      {/* Content based on active tab */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {activeTab === 'responses' && (
            <div>
              <h2 className="card-title mb-4">Quiz Responses</h2>
              {responses.length === 0 ? (
                <div className="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>No public quiz responses available.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Quiz Title</th>
                        <th>Score</th>
                        <th>Result</th>
                        <th>Time Taken</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response) => (
                        <tr key={response._id}>
                          <td className="font-medium">{response.title || 'Untitled Quiz'}</td>
                          <td>{response.percentage.toFixed(1)}%</td>
                          <td>
                            {response.passing_score !== null ? (
                              response.percentage >= response.passing_score ? (
                                <div className="badge badge-success">Passed</div>
                              ) : (
                                <div className="badge badge-error">Failed</div>
                              )
                            ) : (
                              <div className="badge badge-info">No Pass Score</div>
                            )}
                          </td>
                          <td>{formatTime(response.timeTaken)}</td>
                          <td>{formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}</td>
                          <td>
                            <Link href={`/dashboard/quiz/response/${response._id}`} className="btn btn-xs btn-primary">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div>
              <h2 className="card-title mb-4">Created Quizzes</h2>
              {quizzes.length === 0 ? (
                <div className="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>No public quizzes available.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title text-lg">{quiz.title || 'Untitled Quiz'}</h3>
                        <p className="text-sm line-clamp-2">{quiz.description}</p>
                        <div className="flex flex-wrap gap-1 my-2">
                          <div className="badge badge-outline">{quiz.level}</div>
                          <div className="badge badge-outline">{quiz.language}</div>
                          <div className="badge badge-outline">{quiz.category}</div>
                        </div>
                        <div className="text-sm">
                          <p>Questions: {quiz.total_questions}</p>
                          {quiz.duration && <p>Duration: {formatTime(quiz.duration)}</p>}
                          {quiz.passing_score !== null && <p>Passing Score: {quiz.passing_score}%</p>}
                        </div>
                        <div className="card-actions justify-end mt-3">
                          <Link href={`/dashboard/quiz/${quiz._id}/view`} className="btn btn-primary btn-sm">
                            Take Quiz
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <h2 className="card-title mb-4">Performance Statistics</h2>
              {stats.totalResponses === 0 ? (
                <div className="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>No statistics available yet.</span>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Passed Quizzes</div>
                      <div className="stat-value text-success">{stats.passedResponses}</div>
                      <div className="stat-desc">{stats.passedPercentage.toFixed(1)}% of total</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Failed Quizzes</div>
                      <div className="stat-value text-error">{stats.failedResponses}</div>
                      <div className="stat-desc">{stats.failedPercentage.toFixed(1)}% of total</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Average Score</div>
                      <div className="stat-value">{stats.avgScore.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-sm mx-auto">
                    <PieChart
                      series={[
                        {
                          data: [
                            {
                              id: 0,
                              value: stats.failedPercentage.toFixed(1),
                              label: 'Failed',
                              color: 'hsl(0, 72.2%, 50.6%)',
                            },
                            {
                              id: 1,
                              value: stats.passedPercentage.toFixed(1),
                              label: 'Passed',
                              color: 'hsl(142, 70.6%, 45.3%)',
                            },
                          ],
                          arcLabel: (item) => `${item.value}%`,
                          arcLabelMinAngle: 30,
                          highlightScope: {
                            faded: 'global',
                            highlighted: 'item',
                          },
                          faded: {
                            innerRadius: 30,
                            additionalRadius: -30,
                            color: 'hsl(220, 8.9%, 75%)',
                          },
                          highlighted: {
                            innerRadius: -3,
                            additionalRadius: 3,
                          },
                        },
                      ]}
                      width={400}
                      height={200}
                      slotProps={{
                        pieArcLabel: {
                          sx: {
                            fontSize: '1rem',
                            [theme.breakpoints.down('sm')]: {
                              fontSize: '0.75rem',
                            },
                            fill: '#fff',
                          },
                        },
                        legend: {
                          labelStyle: {
                            fill: 'hsl(220, 8.9%, 46.1%)',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}