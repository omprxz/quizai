'use client';
import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from '@/components/Mic';
import showToast from '@/components/showToast'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { IoMdSettings } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { RiLoader2Fill } from "react-icons/ri";
import { LuFilePlus2 } from "react-icons/lu";
import $ from 'jquery';
import dynamic from 'next/dynamic';
import {AiGenerateButton} from '@/components/buttons/buttons'

const useJQueryConfirm = () => {
  useEffect(() => {
    const loadJQueryConfirm = async () => {
      const jQueryConfirm = (await import('jquery-confirm')).default;
      const jQueryConfirmCss = await import('jquery-confirm/dist/jquery-confirm.min.css');
    };

    loadJQueryConfirm();
  }, []);
};

export default function Page() {
  const router = useRouter();
  useJQueryConfirm()
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const maxFileSize = 4 * 1024 * 1024;
  const maxFiles = 5;
  const [isRotated, setIsRotated] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    useFile: false,
    files: [],
    total_questions: '5',
    visibility: 'public',
    level: 'Medium',
    type: ['single_correct', 'multi_correct', 'subjective'],
    category: '',
    duration: '',
    passing_score: '',
    language: 'English',
    shuffle_question: false,
    shuffle_option: false,
    theme: localStorage.getItem('theme') || 'autumn'
  });
  
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  
  const themes = [
      "autumn",
      "luxury",
      "light",
      "dark",
      "coffee",
      "corporate",
      "retro",
      "black",
      "valentine",
      "night"
    ]
  const categories = [
    { value: "art", text: "Art" },
    { value: "business", text: "Business" },
    { value: "comics", text: "Comics" },
    { value: "current_events", text: "Current Events" },
    { value: "economics", text: "Economics" },
    { value: "entertainment", text: "Entertainment" },
    { value: "food", text: "Food" },
    { value: "general_knowledge", text: "General Knowledge" },
    { value: "geography", text: "Geography" },
    { value: "history", text: "History" },
    { value: "languages", text: "Languages" },
    { value: "literature", text: "Literature" },
    { value: "math", text: "Math" },
    { value: "movies", text: "Movies" },
    { value: "music", text: "Music" },
    { value: "mythology", text: "Mythology" },
    { value: "nature", text: "Nature" },
    { value: "philosophy", text: "Philosophy" },
    { value: "politics", text: "Politics" },
    { value: "psychology", text: "Psychology" },
    { value: "religion", text: "Religion" },
    { value: "science", text: "Science" },
    { value: "space", text: "Space" },
    { value: "sports", text: "Sports" },
    { value: "technology", text: "Technology" }
];

  useEffect(() => {
    const handleThemeChange = () => {
      const theme = document.querySelector("html").getAttribute("data-theme");
      if (theme) {
        setFormData((prevData) => ({
          ...prevData,
          theme: theme,
        }));
      }
    };
  
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.querySelector("html"), {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  
    return () => {
      observer.disconnect();
    };
  }, []);
  

  const maxChars = 5000;
  const remainingChars = maxChars - formData.description.length;
  
  const handleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      let newText = formData.description
      if(transcript.trim() !== ""){
       newText = 
        formData.description.slice(0, cursorPosition).trimEnd() + ' ' + 
        transcript + ' ' +
        formData.description.slice(cursorPosition).trimStart();
      }
      setFormData(prev => ({...prev, description: newText}));
      resetTranscript();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };
  
  const handleFileInputButtonClick = () => {
    if(fileInputRef.current){
      if(formData.files.length < maxFiles){
      fileInputRef.current.click()
      }else{
        showToast.error(`You can only upload up to ${maxFiles} files.`);
      }
    }
  }
  
  const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const existingFilesCount = formData.files.length;

  if (existingFilesCount >= maxFiles) {
    showToast.error(`You can only upload up to ${maxFiles} files.`);
    e.target.value = null;
    return;
  }

  let validFiles = [];
  let totalSize = formData.files.reduce((acc, file) => acc + file.size, 0);

  for (const file of selectedFiles) {
    if (file.size > maxFileSize) {
      showToast.error(`File ${file.name} is too large (Limit ${maxFileSize / (1024 * 1024)}MB).`);
      continue;
    }

    if (totalSize + file.size <= maxFileSize) {
      validFiles.push(file);
      totalSize += file.size;
    } else {
      showToast.error(`Adding '${file.name.slice(0, 20)}${file.name.length > 20 ? '...' : ''}' would exceed the total size limit of ${maxFileSize / (1024 * 1024)}MB.`);
    }

    if (validFiles.length + existingFilesCount >= maxFiles) {
      showToast(`You can only upload ${maxFiles} files!`, { icon: '📁'});
      break;
    }
  }

  if (validFiles.length === 0) {
    showToast.error('No valid files selected.');
    e.target.value = null;
    return;
  }

  setFormData(prev => ({
    ...prev,
    files: [...prev.files, ...validFiles]
  }));

  e.target.value = null;
};

  const handleFileRemove = (index) => {
  setFormData(prev => {
    const updatedFiles = prev.files.filter((_, i) => i !== index);
    return {
      ...prev,
      files: updatedFiles
    };
  });
}
  
  const handleChange = (event) => {
  const { name, type, checked } = event.target;
  if (type === 'checkbox') {
    setFormData((prevData) => {
      
      if(['single_correct', 'multi_correct', 'subjective'].includes(name)){
        const newTypeValue = checked
        ? [...prevData.type, name]
        : prevData.type.filter((item) => item !== name);
      return {
        ...prevData,
        type: newTypeValue
      };
      }else{
        return {
          ...prevData,
          [name]: checked
        };
      }
      
      
    });
  } else {
    setFormData((prevData) => ({
      ...prevData,
      [name]: event.target.value
    }));
  }
};

  const handleShowCustomSettings = () => {
    setIsRotated(!isRotated);
    setShowCustomSettings(!showCustomSettings);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true)
    try{
    const { total_questions, duration, passing_score, description, useFile } = formData;
    
    if(!description){
      showToast.error('Quiz description is required for creating quizes.')
      setLoading(false)
      return
    }
    if(description.length < 10){
      showToast.error('Atleast 10 characters required for quiz description.')
      setLoading(false)
      return;
    }

    if (total_questions !== '' && (!Number.isInteger(+total_questions) || +total_questions < 1 || +total_questions > 30)) {
  showToast.error('Number of questions must be an integer between 1 and 30.');
  setLoading(false)
  return;
}
    if (duration && (!Number.isInteger(+duration) || +duration < 30 || +duration > 36000)) {
      showToast.error('Duration must be an integer between 30 and 36000 seconds or null.');
      setLoading(false)
      return;
    }
    
    if (passing_score &&  (+passing_score > 100 || +passing_score < 0)) {
      showToast.error('Passing score must be between 0 and 100 or exactly 0.');
      setLoading(false)
      return;
    }
    if(!Number.isInteger(+passing_score)){
        showToast.error('Passing score must be an integer.');
        setLoading(false)
      return;
      }
    
    if(formData.files.length > 0 && parseInt(total_questions) > 10){
      showToast.error("Max questions limit with file upload is 10 only")
      setLoading(false)
      return;
    }
    
    const processedData = {
      ...formData,
      files: useFile ? formData.files : [],
      total_questions: formData.total_questions ? parseInt(+formData.total_questions) : 10,
      type: formData.type.length == 0 ? ['single_correct'] : formData.type,
      shuffle_option: formData.type.some(type => ['single_correct', 'multi_correct'].includes(type)) ? formData.shuffle_option : false,
      theme: formData['theme'] ? formData['theme'] : 'autumn',
      duration: formData.duration ? +formData.duration : null
    };
    
    console.log(processedData)
    
    setLoading(true)
   axios.post('/api/quiz', processedData, { headers: { 'Content-Type': 'multipart/form-data' } })
  .then(response => {
    setLoading(false);
    showToast.success(response.data.message);
    if(response.data.success){
      
      $.confirm({
    title: 'Quiz Created!',
    content: `<p style="padding: 10px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;" class="form-control">${response?.data?.message || 'Quiz created'}</p>`,
    buttons: {
        edit: {
            text: 'Edit',
            btnClass: 'px-2',
            action: function () {
                router.push('/dashboard/quiz/'+response.data.data.quizId+'/edit');
            }
        },
        view: {
            text: 'View',
            btnClass: 'px-2',
            action: function () {
                router.push('/dashboard/quiz/'+response.data.data.quizId+'/view');
            }
        },
        home: {
            text: 'Home',
            btnClass: 'px-2',
            action: function () {
                router.push('/dashboard');
            }
        }
    },
    useBootstrap: true,
    theme: 'supervan'
});
      
      //router.push(`/dashboard/quiz/${response.data.data.quizId}/edit`)
    }
  })
  .catch(error => {
    console.error(error)
    setLoading(false);
    showToast.error(error?.response?.data?.message || error?.message);
  })
  .finally(() => {
    setLoading(false);
  });
    }catch(e){
      setLoading(false)
      console.error(e)
      showToast.error(e?.message || e?.response?.data?.message || 'Data posting error')
    }
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      level: 'Medium'
    }));
  }, []);

  return (
    <div className='p-4 pt-2'>
      <form className='mt-1 px-2 flex flex-col justify-center items-center w-full gap-y-3 mb-10' onSubmit={handleSubmit}>
      <h1 className='font-bold text-primary text-xl px-2 w-full max-w-sm text-start'>Create Quiz</h1>
        <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
          Title
          <input
          type="text"
          placeholder="Title (Optional)"
          name="title"
          className="text-sm "
          maxLength='250'
          value={formData.title}
          onChange={handleChange}
        />
        </label>

        <label className="w-full max-w-sm mt-1 relative">
          <span className="block mb-1.5 text-base-1000 text-sm">Describe your topic (Required)</span>
          <textarea
            ref={textareaRef}
            placeholder="Describe your topic"
            name='description'
            className="textarea textarea-primary  textarea-bordered border-neutral w-full h-36 pe-12"
            value={formData.description}
            onChange={handleChange}
            maxLength={maxChars}
          ></textarea>
          <div className="absolute right-1.5 bottom-8">
            <Mic micActive={listening} handleMic={handleMic} />
          </div>
          <p className='text-sm text-base-1000'>{remainingChars}/{maxChars} characters remaining</p>
        </label>
        
        <label className="label cursor-pointer gap-6 w-full max-w-sm">
              <span className="label-text text-base-1000">Include files to generate questions</span>
              <input
                type="checkbox"
                name="useFile"
                className="toggle toggle-primary"
                checked={formData.useFile}
                onChange={handleChange}
              />
            </label>
        
        {formData.useFile && (
  <div className='w-full max-w-sm border border-neutral rounded-md p-2'>
    <input
      type="file"
      name='files'
      className='hidden'
      ref={fileInputRef}
      onChange={handleFileChange}
      multiple
    />
    <button type='button' className='btn btn-primary w-full' onClick={handleFileInputButtonClick}>
      <LuFilePlus2 /> Add File
    </button>
    <ul className='mt-3 flex flex-col gap-2'>
      {formData.files.length === 0 ? (
        <li className='text-base-1000 text-sm text-center'>No files selected.</li>
      ) : (
        formData.files.map((file, index) => (
          <li key={index} className='text-sm flex flex-col gap-1 border border-neutral px-3 py-1.5 rounded relative'>
            <span className='overflow-hidden w-full text-ellipsis whitespace-nowrap'>{file.name}</span>
            <p className='text-xs flex gap-1'>
              <span className='uppercase'>{file.type.split('/')[1]}</span>
              <span className='font-black'>·</span>
              <span>{file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}</span>
            </p>
            <IoClose
              className='absolute top-1/2 -translate-y-1/2 right-3 text-error text-xl cursor-pointer'
              onClick={() => handleFileRemove(index)}
            />
          </li>
        ))
      )}
    </ul>
  </div>
)}

        <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
          Questions
          <input
            type="number"
            name="total_questions"
            className="grow text-sm"
            placeholder="Default 10"
            title='Number of questions must be between 1 and 30.'
            value={formData.total_questions}
            onChange={handleChange}
          />
        </label>
        
        <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-2">
              Visibility
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-base-1000"
                name='visibility'
                value={formData.visibility}
                onChange={handleChange}
              >
                 <option value="public">Public</option>
                 <option value="private">Private</option>
              </select>
            </label>
        

        <div className="level w-full max-w-sm">
          <p className='mb-1.5 text-base-1000 text-sm'>Level</p>
          <div className="join">
            <input
              className="join-item btn"
              type="radio"
              name="level"
              value="Easy"
              aria-label="Easy"
              checked={formData.level === 'Easy'}
              onChange={handleChange}
            />
            <input
              className="join-item btn"
              type="radio"
              name="level"
              value="Medium"
              aria-label="Medium"
              checked={formData.level === 'Medium'}
              onChange={handleChange}
            />
            <input
              className="join-item btn"
              type="radio"
              name="level"
              value="Hard"
              aria-label="Hard"
              checked={formData.level === 'Hard'}
              onChange={handleChange}
            />
          </div>
        </div>

        <label className='w-full max-w-sm flex flex-nowrap flex-row justify-between mt-4' onClick={handleShowCustomSettings}>
          <span className='text-primary text-sm select-none underline'>More Settings</span>
          <IoMdSettings
            className={`text-primary text-2xl transition-transform duration-200 ${isRotated ? 'rotate-90 mb-1.5' : ''}`}
          />
        </label>

        {showCustomSettings && (
          <>
            <div className="type w-full max-w-sm">
  <p className='mb-1.5 text-base-1000 text-sm'>Type</p>
  <div className="join">
    <input
      className="join-item btn btn-sm text-sm"
      type="checkbox"
      name="single_correct"
      aria-label="Single Correct"
      checked={formData.type.includes('single_correct')}
      onChange={handleChange}
    />
    <input
      className="join-item btn btn-sm text-sm"
      type="checkbox"
      name="multi_correct"
      aria-label="Multi Correct"
      checked={formData.type.includes('multi_correct')}
      onChange={handleChange}
    />
    <input
      className="join-item btn btn-sm text-sm"
      type="checkbox"
      name="subjective"
      aria-label="Subjective"
      checked={formData.type.includes('subjective')}
      onChange={handleChange}
    />
  </div>
</div>

            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-1">
              Category
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-base-1000"
                name='category'
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Uncategorised">Uncategorised</option>
                {categories.map(category => (
            <option key={category.value} value={category.value}>
                {category.text}
            </option>
        ))}
              </select>
            </label>

            <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
              Duration
              <input
                type="number"
                name="duration"
                className="grow text-sm "
                placeholder="Leave empty for unlimited"
                value={formData.duration}
                onChange={handleChange}
              />
              (in s)
            </label>

                <label className="input input-bordered border-neutral flex items-center gap-2 w-full max-w-sm text-sm mt-1">
                  Passing
                  <input
                    type="number"
                    name="passing_score"
                    className="text-sm w-full "
                    placeholder="% (Optional)"
                    value={formData.passing_score}
                    onChange={handleChange}
                  />
                </label>

            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-1">
              Language
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-base-1000"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="English">English</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Spanish">Spanish</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
                <option value="Arabic">Arabic</option>
                <option value="Bengali">Bengali</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Japanese">Japanese</option>
                <option value="Punjabi">Punjabi</option>
                <option value="German">German</option>
                <option value="Javanese">Javanese</option>
                <option value="Korean">Korean</option>
                <option value="Telugu">Telugu</option>
              </select>
            </label>

            <label className="label cursor-pointer gap-6 w-full max-w-sm">
              <span className="label-text text-base-1000">Shuffle Questions</span>
              <input
                type="checkbox"
                name="shuffle_question"
                className="toggle toggle-primary"
                checked={formData.shuffle_question}
                onChange={handleChange}
              />
            </label>

            <label className="label cursor-pointer gap-6 w-full max-w-sm">
              <span className="label-text text-base-1000">Shuffle Options</span>
              <input
                type="checkbox"
                name="shuffle_option"
                className="toggle toggle-primary"
                checked={formData.shuffle_option}
                onChange={handleChange}
                disabled={!(formData.type.includes('single_correct') || formData.type.includes('multi_correct'))}
              />
            </label>
            <div class="theme w-full max-w-sm">
            <p className='mb-1.5 text-base-1000 text-sm'>Choose theme</p>
            <div className='flex flex-row gap-x-4 flex-nowrap overflow-x-scroll w-full rounded-md py-3 px-4 bg-base'>
            {
              themes.map((theme, index) => (
                <label className='flex flex-col justify-center items-center gap-y-3' key={index}>
                <div className='rounded' data-theme={theme}>
                <div className='flex justify-between items-center w-auto h-10 px-1.5 gap-x-4'>
                <p className='text-sm'>{theme}</p>
                <div className="flex justify-evenly gap-1">
                  <div className='h-8 w-2 bg-primary rounded-md'></div>
                  <div className='h-8 w-2 bg-secondary rounded-md'></div>
                  <div className='h-8 w-2 bg-accent rounded-md'></div>
                  <div className='h-8 w-2 bg-neutral rounded-md'></div>
                </div>
                </div>
                </div>
                <input type="radio" value={theme} name="theme" className="radio radio-sm" onChange={handleChange} checked={formData.theme == theme} />
                </label>
              ))
            }
            </div>
            </div>
          </>
        )}

        <div className='mx-auto mt-6'>
          <AiGenerateButton text={`${loading ? 'Generating Quiz' : 'Generate Quiz'}`} loading={loading} />
        </div>
      </form>
    </div>
  );
}