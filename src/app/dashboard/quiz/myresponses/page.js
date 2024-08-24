"use client"
import axios from 'axios';
import {TdUser} from '@/components/table/Td';
import { useState, useEffect } from "react";
import showToast from '@/components/showToast'
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';

export default function Page() {
  const theme = useTheme();
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/quiz/response/all?filter=user')
      .then(res => {
        setResponses(res.data.data.responses);
        setIsLoading(false);
        setError(null)
      })
      .catch((err) => {
        console.log(err);
        setError(err?.response?.data?.message || err?.message);
        setIsLoading(false);
      });
  }, []);

  const formatTime = (timeInSeconds) => {
    if (timeInSeconds >= 3600) {
      return `${Math.floor(timeInSeconds / 3600)}h ${Math.floor((timeInSeconds % 3600) / 60)}m ${timeInSeconds % 60}s`;
    } else if (timeInSeconds >= 60) {
      return `${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s`;
    } else {
      return `${timeInSeconds}s`;
    }
  };

  const passed = responses.filter(response => response.passing_score !== null ? response.percentage >= response.passing_score : response.percentage >= 0).length;
  const failed = responses.length - passed;
  const total = responses.length;
  const passedPercentage = total > 0 ? (passed / total) * 100 : 0;
  const failedPercentage = total > 0 ? (failed / total) * 100 : 0;

  return (
    <>
      <h1 className='font-bold px-3 text-2xl mb-3 mt-2 py-3 text-center'>My responses</h1>
      {isLoading ? (
        <div className='flex justify-center items-center w-full'>
          <div className="skeleton h-48 w-48 rounded-full flex justify-center items-center text-sm">Loading...</div>
        </div>
      ) : error ? (
        <div className="text-center text-error">{error}</div>
      ) : total === 0 ? (
        <div className="text-center">No responses.</div>
      ) : (
        <div className='w-full flex justify-center items-center select-none'>
        <div className='w-full max-w-sm'>
        <PieChart
  series={[
    {
      data: [
        {
          id: 0,
          value: failedPercentage.toFixed(1),
          label: 'Failed',
          color: 'hsl(0, 72.2%, 50.6%)',
        },
        {
          id: 1,
          value: passedPercentage.toFixed(1),
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
      <section className='w-full px-3 my-2 pt-3 pb-6 max-w-full overflow-x-scroll'>
        <table className="table w-full max-w-full text-sm overflow-x-scroll text-center">
          <thead>
            <tr>
              <th className="border">Title</th>
              <th className="border">Result</th>
              <th className="border">Score</th>
              <th className="border">Passing Score</th>
              <th className="border">Time Taken</th>
              <th className="border">Date</th>
              <th className="border">View Detailed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="border text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="border text-center text-error">
                  {error}
                </td>
              </tr>
            ) : (
              responses.length > 0 ?
              (responses.map((response, index) => (
                <TdUser 
                  key={index} 
                  title={response.title || 'Untitled Quiz'} 
                  score={response.percentage} 
                  result={response.passing_score !== null ? (response.percentage >= response.passing_score ? 'Passed' : 'Failed') : 'Passed'}
                  passing_score={response.passing_score !== null ? (response.passing_score === 0 ? 0 : (response?.passing_score ? response.passing_score : 'N/A')) : "N/A"}
                  timeTaken={formatTime(response.timeTaken)} 
                  submitted={new Date(response.createdAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(',', '')} 
                  id={response._id}
                  quizid={response.quizid}
                />
              ))) : (<tr>
                <td colSpan="7" className="border text-center">
                  Loading...
                </td>
              </tr>)
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}