"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiSolidCategory } from "react-icons/bi";
import { AiOutlineLineChart } from "react-icons/ai";
import { IoLanguageSharp } from "react-icons/io5";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa6";

export default function Page({ params }) {
  const router = useRouter();

  const [quizDetails, setQuizDetails] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [dataStatus, setDataStatus] = useState(0);
  const [dataMsg, setDataMsg] = useState('Loading quiz data, please hold on...');
  
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds >= 3600) {
      return `${Math.floor(timeInSeconds / 3600)}h ${Math.floor((timeInSeconds % 3600) / 60)}m ${timeInSeconds % 60}s`;
    } else if (timeInSeconds >= 60) {
      return `${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s`;
    } else {
      return `${timeInSeconds}s`;
    }
  };

  useEffect(() => {
    axios.get('/api/quiz?id=' + params.quizid)
      .then((res) => {
        setLoggedIn(res.data.loggedIn);

        axios.get('/api/user/any?id=' + res.data.quiz.userid)
          .then((resp) => {
            let quiz = { ...res.data.quiz, createdBy: resp.data.data.name };
            
       if (quiz.shuffle_question) {
        quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
      }

      if (quiz.shuffle_option) {
  quiz.questions = quiz.questions.map(question => 
    question.options ? {
      ...question,
      options: question.options.sort(() => Math.random() - 0.5)
    } : question
  );
}
            
            setDataStatus(1);
            setQuizDetails(quiz);
          })
          .catch((err) => {
            let quiz = { ...res.data.quiz, createdBy: 'Unnamed' };
            setDataStatus(1);
            setQuizDetails(quiz);
          });
      })
      .catch((e) => {
        setDataStatus(-1);
        console.log(e);
        setDataMsg(e?.response?.data?.message || e?.message);
      });
  }, []);

  const [hrs, setHrs] = useState(0);
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [subjectiveAnswerPairs, setSubjectiveAnswerPairs] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [username, setUserName] = useState('');
  const [responseId, setResponseId] = useState('');
  const [quizDuration] = useState(quizDetails.duration);
  const [startTime] = useState(new Date());

  const handleUNameChange = (e) => {
    setUserName(e.target.value);
  };

  const timeOver = () => {
    if (!isSubmitted) {
      toast('Time over! Quiz will be submitted in 2s.', {
        icon: 'ℹ️'
      });
      setTimeout(() => handleSubmit(quizDuration), 2000);
    }
  };

  useEffect(() => {
    let hours = 0, minutes = 0, seconds = 0;
    if (quizDetails.duration != null) {
      const dur = quizDetails.duration;
      hours = Math.floor(dur / 3600);
      minutes = Math.floor((dur % 3600) / 60);
      seconds = dur % 60;
    }
    setHrs(hours);
    setMins(minutes);
    setSecs(seconds);
  }, [quizDetails]);

  useEffect(() => {
    if (quizDetails.duration != null && !isSubmitted) {
      if (quizDetails.duration <= 0) {
        timeOver();
        return;
      }

      const intervalId = setInterval(() => {
        setQuizDetails((prevDetails) => {
          const newDuration = Math.max(prevDetails.duration - 1, 0);
          const newHours = Math.floor(newDuration / 3600);
          const newMinutes = Math.floor((newDuration % 3600) / 60);
          const newSeconds = newDuration % 60;

          setHrs(newHours);
          setMins(newMinutes);
          setSecs(newSeconds);

          return { ...prevDetails, duration: newDuration };
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [quizDetails]);

  const handleAnswerChange = (questionId, optionId, isSingleChoice) => {
    setSelectedAnswers((prevAnswers) => {
      let newAnswers;

      if (isSingleChoice) {
        newAnswers = [optionId]; 
      } else {
        const currentAnswers = prevAnswers[questionId] || [];
        newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter((id) => id !== optionId)
          : [...currentAnswers, optionId];
      }

      return { ...prevAnswers, [questionId]: newAnswers };
    });
  };

  const handleSubjectiveAnswerChange = (questionId, answerText) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: [answerText] 
    }));
  };

const handleSubmit = (tOver) => {
  setIsSubmitted(true);
  let totalCorrect = 0;
  let totalWrong = 0;
  let notAttempted = 0;
  let percentageScored = 0;
  let totalQuestions = quizDetails.questions.length;
  let timeTaken;

  if (tOver) {
    timeTaken = quizDuration;
  } else if (quizDuration != null) {
    timeTaken = quizDuration - quizDetails.duration;
  } else {
    timeTaken = Math.round((new Date() - startTime) / 1000);
  }

  if (!loggedIn && username === '') {
    toast.error('Name required since you are not logged in');
    return;
  }

  setLoading(true);

  let subjectiveAnswers = [];
  quizDetails.questions.forEach((question) => {
    if (question.question_type === 'subjective') {
      
      if (selectedAnswers[question._id] && selectedAnswers[question._id]?.[0] != null && selectedAnswers[question._id]?.[0].trim() !== "") {
    console.log(selectedAnswers[question._id]);
    subjectiveAnswers.push({
        correct: question.correct_answers?.[0],
        user: selectedAnswers[question._id]?.[0],
        questionId: question._id
    });
} else {
    notAttempted++;
}
      
    } else {
      const correctAnswers = question.correct_answers;
      const userAnswers = selectedAnswers[question._id] || [];

      if (userAnswers.length === 0) {
        notAttempted++;
      } else if (question.question_type === 'single_correct') {
        const correct = correctAnswers.length === 1 && correctAnswers?.[0] === userAnswers?.[0];
        if (correct) {
          totalCorrect++;
        } else {
          totalWrong++;
        }
      } else if (question.question_type === 'multi_correct') {
        const correctSet = new Set(correctAnswers);
        const userSet = new Set(userAnswers);

        if (userSet.size === correctSet.size && [...userSet].every(answer => correctSet.has(answer))) {
          totalCorrect++;
        } else {
          totalWrong++;
        }
      }
    }
  });

  const handleSubjectiveAnswers = () => {
    if (subjectiveAnswers.length === 0) {
      return Promise.resolve();
    }

    return axios.post('/api/quiz/response/check-similarity/subjective', { answers: subjectiveAnswers })
      .then(response => {
        response.data.data.forEach(ans => {
          if (ans.score >= 0.7) {
            totalCorrect++;
          } else {
            totalWrong++;
          }
        });
      })
      .catch(error => {
        notAttempted += subjectiveAnswers.length;
        console.error('Error:', error.response ? error.response.data : error.message);
      });
  };

  handleSubjectiveAnswers()
    .then(() => {
     percentageScored = (totalCorrect / totalQuestions) * 100;

      const data = {
        quizid: quizDetails._id,
        passing_score: quizDetails.passing_score,
        username,
        selectedAnswers: selectedAnswers,
        correct: totalCorrect,
        wrong: totalWrong,
        notAttempted: notAttempted,
        total_questions: quizDetails.total_questions,
        percentage: percentageScored,
        timeTaken: timeTaken,
      };

      return axios.post('/api/quiz/response', data);
    })
    .then(response => {
      toast.success(response.data.message);
      if (response.data.success) {
        setResponseId(response.data.data.responseId);
      }
      setResultContent(`
        <br />
        <span class="text-success">Correct: ${totalCorrect}</span><br />
        <span class="text-error">Wrong: ${totalWrong}</span><br />
        <span class="text-info">Not Attempted: ${notAttempted}</span><br />
        <span class="text-warning">Percentage Scored: ${percentageScored.toFixed(2)}%</span><br /><br />
        <span class="text-primary">Time taken: ${formatTime(timeTaken)}</span><br /><br />
      `);
      document.getElementById('result_summary').showModal();
      setLoading(false);
      setIsSubmitted(true);
    })
    .catch(error => {
      console.error('Error submitting quiz:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'An error occurred');
      setLoading(false);
      setIsSubmitted(false);
    });
};

  if (dataStatus === 0) {
    return (
      <div role="alert" className="alert alert-info w-3/4 max-w-sm absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
        <RiLoader2Fill className='animate-spin' />
        <span className='text-sm'>{dataMsg}</span>
      </div>
    );
  } else if (dataStatus === -1) {
    return (
      <div className='mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 text-center'>
        <div role="alert" className="alert alert-error w-full max-w-sm">
          <MdErrorOutline />
          <span className='text-sm'>{dataMsg}</span>
        </div>
        <br />
        <br />
        <Link href='/' className='underline underline-offset-3 text-info'>Go to home</Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <dialog id="result_summary" className="modal" data-theme={quizDetails.theme}>
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
      </div>

      <div className="min-h-screen px-4 py-2 pb-12 w-full flex justify-center" data-theme={quizDetails.theme}>
        <div className="flex flex-col justify-center gap-2 w-full max-w-sm">
          <h1 className="font-bold text-2xl">{quizDetails.title || 'No title'}</h1>
          <p className="text-sm text-neutral">Created by {quizDetails.createdBy}</p>
          <div className="breadcrumbs text-xs">
            <ul className="badge text-xs badge-neutral">
              <li>
                <BiSolidCategory className="me-1" />
                {quizDetails.category || 'Uncategorised'}
              </li>
              <li>
                <AiOutlineLineChart className="me-1" />
                {quizDetails.level || 'No level'}
              </li>
              <li>
                <IoLanguageSharp className="me-1" />
                {quizDetails.language || 'No language'}
              </li>
            </ul>
          </div>
          <p className="text-sm">Total questions: {quizDetails.total_questions || 'Null'}</p>
          {quizDetails.duration && quizDetails.duration > 0 && (
            <div className="flex justify-center w-full mt-2">
              <span className={`countdown font-mono text-3xl ${hrs === 0 && mins === 0 && secs <= 10 && 'text-red-500'}`}>
                <span style={{ "--value": hrs }}></span>h 
                <span style={{ "--value": mins }}></span>m 
                <span style={{ "--value": secs }}></span>s
              </span>
            </div>
          )}

          {!loggedIn && (
            <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
              Name
              <input
                type="text"
                placeholder="Name (Required)"
                name="title"
                className="text-sm"
                maxLength='250'
                value={username}
                onChange={handleUNameChange}
              />
            </label>
          )}

          <div className="flex flex-col justify-center w-full items-start mt-4 gap-y-5">
            {quizDetails.questions.map((question, index) => (
              <div className="rounded-md px-3 py-4 shadow-md w-full shadow-neutral" key={question._id}>
                <p className="font-bold text-sm">{index + 1}. {question.question_text}</p>
                <div className="flex flex-col justify-center items-start gap-2 mt-3">
                  {question.question_type === 'subjective' ? (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Enter your answer here"
                      onChange={(e) => handleSubjectiveAnswerChange(question._id, e.target.value)}
                    ></textarea>
                  ) : (
                    question.options.map((option) => (
                      <label className="w-full space-y-2 whitespace-normal break-words" key={option.id}>
                        <input
                          type={question.question_type === 'single_correct' ? 'radio' : 'checkbox'}
                          name={question._id}
                          value={option.id}
                          checked={selectedAnswers[question._id]?.includes(option.id)}
                          onChange={() => handleAnswerChange(question._id, option.id, question.question_type === 'single_correct')}
                        /> {option.text}
                      </label>
                    ))
                  )}

                  {question.question_type !== 'subjective' && (
                    <div className='w-full flex justify-end px-3 my-1'>
                      <button
                        className="font-bold text-sm mt-2"
                        onClick={() => setSelectedAnswers((prevAnswers) => ({ ...prevAnswers, [question._id]: [] }))}
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mx-auto mt-7">
            <button className="btn btn-primary disabled:text-base-100 disabled:bg-primary" onClick={() => handleSubmit(false)} disabled={loading} >
              {loading ? (
                <>
                  <RiLoader2Fill className='animate-spin' />
                  Submitting
                </>
              ) : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}