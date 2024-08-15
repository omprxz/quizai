"use client"
import React, { useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from '@/components/Mic';

const SpeechToTextPage = () => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const newText = 
        text.slice(0, cursorPosition).trimEnd() + ' ' + 
        transcript + ' ' +
        text.slice(cursorPosition).trimStart();
      setText(newText);
      resetTranscript();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-base-200 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Speech to Text</h1>
      <div className="relative mb-6">
        <Mic micActive={listening} handleMic={handleMic} />
      </div>
      <textarea
        ref={textareaRef}
        className="textarea textarea-bordered w-full max-w-lg h-64 p-4 mt-6"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        cols={50}
      />
    </div>
  );
};

export default SpeechToTextPage;