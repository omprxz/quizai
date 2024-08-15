import React from 'react';
import { MdMicNone, MdOutlineMicOff } from 'react-icons/md';
import '@/styles/mic.css';

const Mic = ({ micActive, handleMic }) => {
  return (
    <div
      className={`mic-container ${micActive ? 'active' : ''}`}
      onClick={handleMic}
    >
      <div className="circle" />
      <div className="circle" />
      <div className="circle" />
      {micActive ? (
        <MdOutlineMicOff className="mic-icon text-black dark:text-white" />
      ) : (
        <MdMicNone className="mic-icon text-black dark:text-white" />
      )}
    </div>
  );
};

export default Mic;