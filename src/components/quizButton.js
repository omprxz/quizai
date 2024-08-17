"use client";
import { FaGlobe, FaChartPie } from "react-icons/fa6";
import { FcPlus } from "react-icons/fc";
import { MdSchool, MdEdit, MdVisibility, MdBarChart } from 'react-icons/md';
import { IoLinkOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import Link from "next/link";
import $ from 'jquery';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RiLoader2Fill, RiDeleteBinFill, RiLock2Fill, RiGlobalFill, RiLoader4Line } from "react-icons/ri";
import { IoMdRefresh } from "react-icons/io";
import Select from 'react-select';

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
        <FcPlus className='text-5xl text-black dark:text-white' />
        <p className='text-black dark:text-white font-bold pt-1.5'>Create Quiz</p>
      </Link>
    </div>
  );
}

export function QuizButton({
  id,
  title,
  visibility,
  createdAt,
  total_questions,
  response_count,
  fetchQuizList = () => {}
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [isRequesting, setIsRequesting] = useState(false);
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
            axios.delete('/api/quiz?id=' + id).then((res) => {
              toast.success(res.data.message);
              if (res.status !== 201) {
                fetchQuizList();
              }
            }).catch(err => toast.error(err.response?.data?.message || err.message || 'Unable to delete quiz')).finally(() => document.getElementById('deleting').close());
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

  const handleVisibilityChange = (selectedOption) => {
    const newVisibility = selectedOption.value;
    if (newVisibility === currentVisibility) return;
    const oldVisibility = currentVisibility;
    setCurrentVisibility(newVisibility);
    setIsRequesting(true);

    axios.patch('/api/quiz/patch/visibility', { id, visibility: newVisibility })
      .then(response => {
        toast.success(response.data.message);
      })
      .catch(error => {
        setCurrentVisibility(oldVisibility);
        toast.error(error.response?.data?.message || error.message || 'Unable to change visibility');
      })
      .finally(() => setIsRequesting(false));
  };

  const visibilityOptions = [
    { value: 'public', icon: <FaGlobe className="text-blue-500 text-xl" /> },
    { value: 'private', icon: <RiLock2Fill className="text-red-500 text-xl" /> }
  ];

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
        
          <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 transition duration-200 ease-in-out">
            {isDeleting ? (
              <RiLoader2Fill className="text-xl animate-spin" />
            ) : (
              <RiDeleteBinFill className="text-xl" />
            )}
          </button>
          <Link href={`/dashboard/quiz/${id}/edit`} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <MdEdit className="text-xl" />
          </Link>
          <Link href={`/dashboard/quiz/${id}/view`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <MdVisibility className="text-xl" />
          </Link>
          <button onClick={handleCopyClick} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <IoLinkOutline className="text-xl" />
          </button>
          <Link href={`/dashboard/quiz/${id}/responses`} className="text-gray-500 hover:text-primary transition duration-200 ease-in-out">
            <FaChartPie className="text-xl" />
          </Link>
          <div className='relative pe-2'>
          <Select
  options={visibilityOptions}
  value={visibilityOptions.find(option => option.value === currentVisibility)}
  onChange={handleVisibilityChange}
  isDisabled={isRequesting}
  isSearchable={false}
  isClearable={false}
  components={{ IndicatorSeparator: () => null }}
  filterOption={(option) => option.data.value !== currentVisibility}
  styles={{
    control: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        border: 'none',
      },
      marginBottom: 0,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'oklch(var(--b1))',
      marginTop: 0,
      padding: 0,
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: 'oklch(var(--b1))',
      height: '30px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4px auto',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'hsl(220, 8.9%, 46.1%)',
      padding: '0',
      svg: {
        width: '14px',
        height: '14px',
      },
    }),
  }}
  formatOptionLabel={({ icon }) => (
    <div className="flex items-center justify-center">
      {icon}
    </div>
  )}
  className="react-select-container"
  classNamePrefix="react-select"
/>
{ isRequesting && <>
      <p className='w-full h-full bg-gray-700 absolute top-0 left-0 mix-blend-lighten dark:mix-blend-darken'></p>
      <div className='absolute top-0 left-0 w-full h-full'>
        <div className='flex w-full h-full justify-center items-center'>
          <span className='loading loading-ring loading-sm'></span>
        </div>
      </div>
      </> }
        </div>
        </div>

        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Questions: {total_questions}</span>
          <span>{createdAt}</span>
          <span className='flex gap-0.5 justify-center items-center'>
            Responses: {!response_count ? (
              <IoMdRefresh className="text-sm animate-spin" />
            ) : (
              response_count
            )}
          </span>
        </div>
      </li>
    </>
  );
}