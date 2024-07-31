"use client"
import { FaPlus, FaEllipsisVertical } from "react-icons/fa6";
import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import $ from 'jquery';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';

const useJQueryConfirm = () => {
  useEffect(() => {
    const loadJQueryConfirm = async () => {
      const jQueryConfirm = (await import('jquery-confirm')).default;
      const jQueryConfirmCss = await import('jquery-confirm/dist/jquery-confirm.min.css');
    };

    loadJQueryConfirm();
  }, []);
};

export function CreateQuizButton() {
  return (
    <Link href="/quiz/create" className='border border-[3px] rounded-md w-[135px] md:w-[155px] h-[135px] md:h-[155px] max-w-[135px] md:max-w-[155px] max-h-[135px] md:max-h-[155px] border-neutral-800 inline-block flex items-center justify-center'>
      <FaPlus className='text-5xl text-neutral' />
    </Link>
  );
}

export function QuizButton({ id, title }) {
  const [optOpen, setOptOpen] = useState(false);
  useJQueryConfirm(); // Ensure jquery-confirm is loaded

  const handleDeleteClick = () => {
    setOptOpen(false);
    $.confirm({
      title: 'Delete this quiz?',
      content: 'This action can\'t be reverted.',
      theme: 'supervan',
      animation: 'scale',
      buttons: {
        confirm: {
          text: 'Confirm',
          action: function () {
            console.log(id);
            toast.success("Quiz deleted");
          },
        },
        cancel: {
          text: 'Cancel',
          action: function () {
            console.log('Canceled!');
          }
        }
      }
    });
  };

  return (
    <div className='border border-[3px] rounded-md w-[135px] md:w-[155px] h-[135px] md:h-[155px] max-w-[135px] md:max-w-[155px] max-h-[135px] md:max-h-[155px] border-neutral-800 inline-block relative overflow-hidden'>
      <Link href={`/quiz/${id}`}>
        <Image
          src='/quiz.webp'
          className='absolute top-0 left-0 object-cover rounded-md aspect-square'
          width="135"
          height="135"
          alt="Quiz Image"
        />
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-neutral-800 to-transparent w-[135px] md:w-[155px] h-[100px] md:h-[120px]"></div>
        <p className='font-black text-sm z-50 text-gray-100 absolute bottom-0 left-0 w-[135px] md:w-[155px] h-[25px] overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5'>{title}</p>
      </Link>
      <div className='absolute top-0 right-0 px-1 py-2' onClick={() => setOptOpen(!optOpen)}>
        <FaEllipsisVertical className='text-xl' />
      </div>
      <div className={`bg-neutral-100 px-5 py-1 rounded-md absolute top-5 right-5 flex-col gap-y-1 justify-start shadow-md shadow-black ${optOpen ? 'flex' : 'hidden'}`}>
        <Link onClick={() => setOptOpen(false)} href={`/quiz/${id}/edit`}>Edit</Link>
        <hr className='bg-gray-400 w-full h-[1px]' />
        <button onClick={handleDeleteClick}>Delete</button>
      </div>
    </div>
  );
}