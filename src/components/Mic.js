import React from 'react';
import { MdMicNone, MdOutlineMicOff } from 'react-icons/md';
import '@/styles/mic.css';

const Mic = ({ micActive, handleMic, className, micClassName }) => {
  return (
    <div
      className={`mic-container ${className} flex justify-center items-center rounded-full relative cursor-pointer w-[40px] h-[40px] ${micActive ? 'active' : ''}`}
      onClick={handleMic}
    >
      <div className={`circle`} />
      <div className={`circle`} />
      <div className={`circle`} />
      {micActive ? (
        <MdOutlineMicOff className={`mic-icon ${micClassName} text-[1.3rem] z-10 text-black dark:text-white`} />
      ) : (
        <MdMicNone className={`mic-icon ${micClassName} text-[1.3rem] z-10 text-black dark:text-white`} />
      )}
    </div>
  );
};

export default Mic;