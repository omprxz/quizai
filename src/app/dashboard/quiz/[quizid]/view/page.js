"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiSolidCategory } from "react-icons/bi";
import { AiOutlineLineChart } from "react-icons/ai";
import { IoLanguageSharp } from "react-icons/io5";
import axios from 'axios'
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa6";

export default function Page({ params }) {
  const router = useRouter();

  const [quizDetails, setQuizDetails] = useState({});
  const [loggedIn, setLoggedIn] = useState(false)
  const [dataStatus, setDataStatus] = useState(0)
  const [dataMsg, setDataMsg] = useState('Loading quiz data, please hold on...')
  
  useEffect(() => {
  axios.get('/api/quiz?id=' + params.quizid).then((res) => {
    setLoggedIn(res.data.loggedIn);
    
    axios.get('/api/user/any?id=' + res.data.quiz.userid).then((resp) => {
      let quiz = { ...res.data.quiz, createdBy: resp.data.data.name };

      if (quiz.shuffle_question) {
        quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
      }

      if (quiz.shuffle_option) {
        quiz.questions = quiz.questions.map(question => ({
          ...question,
          options: question.options.sort(() => Math.random() - 0.5)
        }));
      }

      setDataStatus(1);
      setQuizDetails(quiz);
    }).catch((err) => {
      let quiz = { ...res.data.quiz, createdBy: 'Unnamed' };

      if (quiz.shuffle_question) {
        quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
      }

      if (quiz.shuffle_option) {
        quiz.questions = quiz.questions.map(question => ({
          ...question,
          options: question.options.sort(() => Math.random() - 0.5)
        }));
      }

      setDataStatus(1);
      setQuizDetails(quiz);
    });
  }).catch((e) => {
    setDataStatus(-1);
    console.log(e);
    setDataMsg(e?.response?.data?.message || e?.message);
  });
}, []);
  
  const [hrs, setHrs] = useState(0);
  const [mins, setMins] = useState(0);
  const [secs, setSecs] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultContent, setResultContent] = useState(null)
  const [username, setUserName] = useState('')
  const [responseId, setResponseId] = useState('')
  const [quizDuration] = useState(quizDetails.duration)
  const [startTime] = useState(new Date());
  
  const handleUNameChange = (e) => {
    setUserName(e.target.value)
  }
  
  const timeOver = () => {
  if (!isSubmitted) {
    toast('Time over! Quiz will be submitted in 2s.', {
      icon: 'ℹ️'
    });
    setTimeout(() => handleSubmit(quizDuration), 2000);
  }
};

  const handleSubmit = (tOver) => {
  let totalCorrect = 0;
  let totalWrong = 0;
  let notAttempted = 0;
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

  axios.get('/api/quiz/getUpdatedAnswers?quizId=' + quizDetails._id)
    .then(response => {
      const updatedQuestions = response.data.questions;
      const updatedCorrectAnswers = updatedQuestions.reduce((acc, question) => {
        acc[question._id] = question.correct_answers;
        return acc;
      }, {});

      quizDetails.questions.forEach((question) => {
        const correctAnswers = updatedCorrectAnswers[question._id];
        const userAnswers = selectedAnswers[question._id] || [];

        if (userAnswers.length === 0) {
          notAttempted++;
        } else if (question.question_type === 'single_correct') {
          const correct = correctAnswers.length === 1 && correctAnswers[0] === userAnswers[0];
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
      });

      const percentageScored = (totalCorrect / totalQuestions) * 100;

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

      axios.post('/api/quiz/response', data)
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
            <span class="text-primary">Time taken: ${timeTaken}s</span><br /><br />
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
    })
    .catch(error => {
      console.error('Error fetching updated answers:', error.response?.data || error.message);
      toast.error('Error fetching updated answers');
      setLoading(false);
      setIsSubmitted(false);
    });
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
    let timeCounter = 0;

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

  return (
    <>
      
      {quizDetails._id &&
      <>
        <div>
        <dialog id="result_summary" className="modal" data-theme={quizDetails.theme}>
  <div className="modal-box">
    <h3 className="font-bold text-lg">Result</h3>
    <div
      dangerouslySetInnerHTML={{ __html: resultContent }}
    />
      <div className="modal-action mx-auto flex justify-center items-center">
      <Link href={`/dashboard/quiz/response/${responseId}`} className="btn btn-primary"><FaClipboardCheck /> View Detailed Result</Link>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

      </div>
      
      
      <div className="min-h-screen px-4 py-2 pb-12" data-theme={quizDetails.theme}>
        <div className="flex flex-col items-start justify-center gap-2">
          <h1 className="font-bold mt-2 text-2xl">{quizDetails.title ? quizDetails.title : 'No title'}</h1>
          <p className="text-sm text-neutral">Created by {quizDetails.createdBy}</p>
          <div className="breadcrumbs text-xs">
            <ul className="badge text-xs badge-neutral">
              <li>
                <a>
                  <BiSolidCategory className="me-1" />
                  {quizDetails.category ? quizDetails.category : 'Uncategorised'}
                </a>
              </li>
              <li>
                <a>
                  <AiOutlineLineChart className="me-1" />
                  {quizDetails.level ? quizDetails.level : 'No level'}
                </a>
              </li>
              <li>
                <a>
                  <IoLanguageSharp className="me-1" />
                  {quizDetails.language ? quizDetails.language : 'No language'}
                  </a>
              </li>
            </ul>
          </div>
          <p className="text-sm">Total questions: {quizDetails.total_questions ? quizDetails.total_questions : 'Null'}</p>
          {quizDetails.duration && quizDetails.duration > 0 && (
            <div className="flex justify-center w-full mt-2">
              <span className={`countdown font-mono text-3xl ${hrs === 0 && mins === 0 && secs <= 10 && 'text-red-500'}`}>
                <span style={{ "--value": hrs }}></span>h&nbsp;
                <span style={{ "--value": mins }}></span>m&nbsp;
                <span style={{ "--value": secs }}></span>s
              </span>
            </div>
          )}
          
         { !loggedIn && <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
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
        </label> }
          
          <div className="flex flex-col justify-center w-full items-start mt-4 gap-y-5">
            {quizDetails.questions.map((question, index) => (
              <div className="rounded-md px-3 py-4 shadow-md w-full shadow-neutral" key={question._id}>
                <p className="font-bold text-sm">{index + 1}. {question.question_text}</p>
                <div className="flex flex-col justify-center items-start gap-2 mt-3">
                  {question.options.map((option) => (
  <label className="flex flex-row whitespace-break-spaces justify-start w-full items-center gap-2" key={option.id}>
    <input
      type={question.question_type === 'single_correct' ? 'radio' : 'checkbox'}
      name={question._id}
      value={option.id}
      checked={selectedAnswers[question._id]?.includes(option.id)}
      onChange={() => handleAnswerChange(question._id, option.id, question.question_type === 'single_correct')}
    /> {option.text}
  </label>
))}
<div className='w-full flex justify-end px-3 my-1'>
  <button 
    className="font-bold text-sm mt-2" 
    onClick={() => setSelectedAnswers((prevAnswers) => ({ ...prevAnswers, [question._id]: [] }))}>
    Clear Selection
  </button>
</div>
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
}
      {
        dataStatus == 0 ? (
         <div role="alert" className="alert alert-info mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
          <RiLoader2Fill className='animate-spin' />
  <span className='text-sm'>{dataMsg}</span>
</div>
          ) : (
          dataStatus == -1 ? (
            <div className=' mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 text-center'>
            <div role="alert" className="alert alert-error w-full">
              <MdErrorOutline />
              <span className='text-sm'>{dataMsg}</span>
            </div>
            <br />
            <br />
            <Link href='/' className='underline underline-offset-3 text-info'>Go to home</Link>
            </div>
            ): ''
        )
      }

    </>
  );
}