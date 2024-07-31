'use client';
import useLogout from "@/utils/logout";
import {CreateQuizButton, QuizButton} from "@/components/quizButton"

export default function Page() {
  const logOut = useLogout();

  return (
    <div className=''>
      <h1 className='text-2xl font-black mt-5 mb-2 mx-7'>Your Quizes</h1>
      <div className='flex flex-row flex-wrap gap-6 my-4 justify-evenly md:justify-start md:gap-y-10 md:gap-8 px-7'>
        <CreateQuizButton />
        <QuizButton id="1" title="DSA Quiz for devs" />
        <QuizButton id="2" title="DSA Quiz for devs" />
        <QuizButton id="3" title="DSA Quiz for devs" />
        <QuizButton id="4" title="DSA Quiz for devs" />
        <QuizButton id="5" title="DSA Quiz for devs" />
        <QuizButton id="6" title="DSA Quiz for devs" />
      </div>
      {<button className='btn my-8 mx-8' onClick={logOut}>Logout</button>}
    </div>
  );
}