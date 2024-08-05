"use client"
import { FaPlus, FaEllipsisVertical } from "react-icons/fa6";
import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import $ from 'jquery';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdSchool } from "react-icons/md";
import { RiLoader2Fill } from "react-icons/ri";

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
    <Link href="/quiz/create" className='border border-[3px] rounded-md w-[135px] md:w-[155px] h-[135px] md:h-[155px] max-w-[135px] md:max-w-[155px] max-h-[135px] md:max-h-[155px] border-primary inline-block flex items-center justify-center'>
      <FaPlus className='text-5xl text-primary' />
    </Link>
  );
}

export function QuizButton({ id, title, fetchQuizList = () => {}}) {
  const [optOpen, setOptOpen] = useState(false);
  useJQueryConfirm();

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
            document.getElementById('deleting').showModal()
            axios.delete('/api/quiz?id='+id).then((res) => {
              toast.success(res.data.message)
              if(res.status !== 201){
              fetchQuizList()
              }
            }).catch(err => toast.error(err.response.data.message)).finally(() => document.getElementById('deleting').close())
          },
        },
        cancel: {
          text: 'Cancel',
          action: function () {
            console.log('Deletion Canceled!');
          }
        }
      }
    });
  };

  return (
    <>
    
    <dialog id="deleting" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Deleting...</h3>
    <div className='flex justify-center mt-3'>
     <RiLoader2Fill className='text-3xl animate-spin' />
    </div>
  </div>
</dialog>
    
    <div className='border border-[3px] rounded-md w-[135px] md:w-[155px] h-[135px] md:h-[155px] max-w-[135px] md:max-w-[155px] max-h-[135px] md:max-h-[155px] border-primary inline-block relative overflow-hidden'>
      <Link href={`/quiz/${id}/view`}>
        <div className="flex items-center justify-center">
          <MdSchool className='text-8xl' />
        </div>
        
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-primary-content to-transparent w-[135px] md:w-[155px] h-[100px] md:h-[120px] opacity-70"></div>
        <p className='font-black text-sm z-10 absolute bottom-0 left-0 w-[135px] md:w-[155px] h-[25px] overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5'>{title}</p>
      </Link>
      <div className='absolute top-0 right-0 px-1 py-2' onClick={() => setOptOpen(!optOpen)}>
        <FaEllipsisVertical className='text-xl text-black dark:text-white' />
      </div>
      <div className={`bg-primary z-10 px-5 py-1 rounded-md absolute top-5 right-5 flex-col gap-y-1 justify-start shadow-md shadow-black text-base-100 text-sm ${optOpen ? 'flex' : 'hidden'}`}>
        <Link onClick={() => setOptOpen(false)} href={`/quiz/${id}/edit`}>Edit  </Link>
        <hr className='bg-gray-400 w-full h-[1px]' />
        <Link onClick={() => setOptOpen(false)} href={`/quiz/${id}/view`}>View  </Link>
        <hr className='bg-gray-400 w-full h-[1px]' />
        <button onClick={handleDeleteClick}>Delete</button>
      </div>
    </div>
    </>
  );
}