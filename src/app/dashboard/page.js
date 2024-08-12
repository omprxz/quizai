'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import useLogout from "@/utils/logout";
import { CreateQuizButton, QuizButton } from "@/components/quizButton";
import { toast } from 'react-hot-toast';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";

export default function Page() {
  const logOut = useLogout();
  
  const [quizList, setQuizList] = useState([]);
  const [dataStatus, setDataStatus] = useState(0);
  const [dataMsg, setDataMsg] = useState('Loading quizzes...');
  
  const fetchQuizList = () => {
    axios.get('/api/quiz/all')
      .then((res) => {
        res.data.success && setQuizList(res.data.quizzes);
        setDataStatus(1);
        setDataMsg('');
      })
      .catch((error) => {
        if (error.response.status === 404) {
          setDataStatus(404);
          setQuizList([]);
        } else {
          toast.error(error.response.data.message);
          setDataStatus(-1);
        }
        setDataMsg(error.response.data.message);
      });
  };
  
  useEffect(() => {
    fetchQuizList();
    const intervalId = setInterval(fetchQuizList, 20000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div>
      <div className='flex flex-col gap-6 my-4 justify-evenly md:justify-start px-3'>
        <CreateQuizButton />
        {quizList.length > 0 && quizList.map((quiz, index) => (
          <QuizButton
            key={index}
            id={quiz._id}
            title={quiz.title}
            visibility={quiz.visibility}
            total_questions={quiz.total_questions}
            language={quiz.language}
            level={quiz.level}
            fetchQuizList={fetchQuizList}
          />
        ))}
      </div>
      <div className={`alert w-4/5 mx-auto mt-14 ${dataStatus === 0 ? 'alert-info' : (dataStatus === 404 ? 'alert-info' : 'alert-error')} ${dataStatus === 1 && 'hidden'}`}>
        {
          dataStatus === 0 ? <RiLoader2Fill className='text-2xl animate-spin' /> : (dataStatus === 404 ? '' : <MdErrorOutline className='text-2xl' />)
        }
        {dataMsg}
      </div>
    </div>
  );
}