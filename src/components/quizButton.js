"use client";
import { FaPlus, FaGlobe, FaLock } from "react-icons/fa6";
import { MdSchool, MdEdit, MdDelete, MdVisibility, MdBarChart } from 'react-icons/md';
import { IoLinkOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import Link from "next/link";
import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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
    <div className='flex justify-center items-center mt-2'>
      <Link href="/dashboard/quiz/create" className='border border-[3px] rounded-md w-[125px] md:w-[145px] h-[125px] md:h-[145px] max-w-[125px] md:max-w-[145px] max-h-[125px] md:max-h-[145px] border-black dark:border-white inline-block flex flex-col items-center justify-center gap-2'>
        <FaPlus className='text-4xl text-black dark:text-white' />
        <p className='text-black dark:text-white font-bold pt-1.5'>Create Quiz</p>
      </Link>
    </div>
  );
}

export function QuizButton({ id, title, visibility, createdAt, total_questions, response_count, fetchQuizList = () => {} }) {
  const [isDeleting, setIsDeleting] = useState(false);
  useJQueryConfirm();

  const handleDeleteClick = () => {
    $.confirm({
      title: 'Delete this quiz?',
      content: 'This action can\'t be reverted.',
      theme: 'supervan',
      animation: 'scale',
      buttons: {
        confirm: {
          text: 'Confirm',
          action: function () {
            document.getElementById('deleting').showModal();
            axios.delete('/api/quiz?id='+id).then((res) => {
              toast.success(res.data.message);
              if(res.status !== 201){
                fetchQuizList();
              }
            }).catch(err => toast.error(err.response.data.message)).finally(() => document.getElementById('deleting').close());
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

  const handleCopyClick = () => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/quiz/${id}/view`);
    toast.success('Quiz link copied to clipboard!');
  };

  return (
    <>
      <dialog id="deleting" className="modal">
        <div className="modal-box glass">
          <h3 className="font-bold text-lg">Deleting...</h3>
          <div className='flex justify-center mt-3'>
            <RiLoader2Fill className='text-3xl animate-spin' />
          </div>
        </div>
      </dialog>
      <li className="flex flex-col gap-3 shadow-md shadow-neutral bg-primary-content px-3 py-4 rounded-md w-full max-w-sm">
        <div className='flex gap-2 items-center'>
          <MdSchool className="text-primary text-xl shrink-0 mr-2" />
          <Link href={`/dashboard/quiz/${id}/view`} className="font-medium text-ellipsis whitespace-nowrap overflow-hidden">
            {title}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2">
          {visibility === 'public' ? (
            <FaGlobe className="text-blue-500" title="Public" />
          ) : (
            <FaLock className="text-red-500" title="Private" />
          )}
          <Link href={`/dashboard/quiz/${id}/edit`} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <MdEdit className="text-xl" />
          </Link>
          <Link href={`/dashboard/quiz/${id}/view`} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <MdVisibility className="text-xl" />
          </Link>
          <button onClick={handleCopyClick} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <IoLinkOutline className="text-xl" />
          </button>
          <Link href={`/dashboard/quiz/${id}/responses`} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <MdBarChart className="text-xl" />
          </Link>
          <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 transition duration-200 ease-in-out">
            {isDeleting ? (
              <RiLoader2Fill className="text-xl animate-spin" />
            ) : (
              <MdDelete className="text-xl" />
            )}
          </button>
        </div>

        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Questions: {total_questions}</span>
          <span>{createdAt}</span>
          <span>Responses: {response_count}</span>
        </div>
      </li>
    </>
  );
}