'use client';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IoMdSettings } from "react-icons/io";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import Link from 'next/link'
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import { BsStars } from "react-icons/bs";
import $ from 'jquery';
import dynamic from 'next/dynamic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from '@/components/Mic';

const useJQueryConfirm = () => {
  useEffect(() => {
    const loadJQueryConfirm = async () => {
      const jQueryConfirm = (await import('jquery-confirm')).default;
      const jQueryConfirmCss = await import('jquery-confirm/dist/jquery-confirm.min.css');
    };

    loadJQueryConfirm();
  }, []);
};

export default function Page({ params }) {
  const router = useRouter();
  const { quizid } = params;
  useJQueryConfirm();

  const [isRotated, setIsRotated] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addQuestionsLoading, setAddQuestionsLoading] = useState(false);
  const [titleErrMsg, setTitleErrMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    category: '',
    duration: '',
    visibility: '',
    passing_score: '',
    language: '',
    shuffle_question: false,
    shuffle_option: false,
    theme: "",
    questions: []
  });
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    useExistingTopic: true,
    description: '',
    type: ['single_correct'],
    level: 'Medium',
    language: 'English',
    total_questions: 1,
  });
  const [dataStatus, setDataStatus] = useState(0);
  const [dataMsg, setDataMsg] = useState('Loading quiz data, please hold on...');

  const themes = [
    "autumn", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset",
  ];
  const categories = [
    { value: "art", text: "Art" }, { value: "business", text: "Business" }, { value: "comics", text: "Comics" }, { value: "current_events", text: "Current Events" }, { value: "economics", text: "Economics" }, { value: "entertainment", text: "Entertainment" }, { value: "food", text: "Food" }, { value: "general_knowledge", text: "General Knowledge" }, { value: "geography", text: "Geography" }, { value: "history", text: "History" }, { value: "languages", text: "Languages" }, { value: "literature", text: "Literature" }, { value: "math", text: "Math" }, { value: "movies", "text": "Movies" }, { value: "music", text: "Music" }, { value: "mythology", text: "Mythology" }, { value: "nature", text: "Nature" }, { value: "philosophy", text: "Philosophy" }, { value: "politics", text: "Politics" }, { value: "psychology", text: "Psychology" }, { value: "religion", text: "Religion" }, { value: "science", text: "Science" }, { value: "space", text: "Space" }, { value: "sports", text: "Sports" }, { value: "technology", text: "Technology" }
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const aiTextareaRef = useRef(null);

  const handleMic = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      const textarea = aiTextareaRef.current;
      const cursorPosition = textarea.selectionStart;
      let newText = aiFormData.description;
      if (transcript.trim() !== "") {
        newText =
          aiFormData.description.slice(0, cursorPosition).trimEnd() +
          ' ' +
          transcript +
          ' ' +
          aiFormData.description.slice(cursorPosition).trimStart();
      }
      setAiFormData(prev => ({ ...prev, description: newText }));
      resetTranscript();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleChange = (event) => {
    const { name, type, checked } = event.target;
    if (type === 'checkbox') {
      setFormData(prevData => ({ ...prevData, [name]: checked }));
    } else {
      if (name === 'title') {
        if (event.target.value.length <= 250) {
          setFormData(prevData => ({ ...prevData, [name]: event.target.value }));
        } else {
          setTitleErrMsg('Max title length limit is 250 chars');
        }
      } else {
        setFormData(prevData => ({ ...prevData, [name]: event.target.value }));
      }
    }
  };

  const handleQuestionChange = (e, q_id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question._id === q_id ? { ...question, question_text: e.target.value } : question
      )
    }));
  };

  const handleOptionChange = (e, q_id, o_id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question._id === q_id
          ? {
            ...question,
            options: question.options.map(option =>
              option._id === o_id ? { ...option, text: e.target.value } : option
            ),
          }
          : question
      ),
    }));
  };

  const handleReasonChange = (e, q_id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question._id === q_id ? { ...question, reason: e.target.value } : question
      ),
    }));
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          question_type: formData.type.includes('single_correct') ? "single_correct" : "multi_correct",
          question_text: '',
          options: [{ _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 1, text: '' }, { _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 2, text: '' }],
          correct_answers: [],
          reason: ''
        },
      ],
    }));
  };

  const handleRemoveQuestion = (q_id) => {
    if (formData.questions.length === 1) {
      toast.error('At least one question is needed');
      return;
    }
    setFormData(prev => ({ ...prev, questions: prev.questions.filter(question => question._id !== q_id) }));
  };

  const handleAddOption = (q_id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question._id === q_id
          ? {
            ...question,
            options: [
              ...question.options,
              {
                _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                id: question.options.length + 1,
                text: '',
              },
            ],
          }
          : question
      ),
    }));
  };

  const handleRemoveOption = (q_id, o_id) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(question => {
        if (question._id === q_id) {
          if (question.options.length <= 2) {
            toast.error('At least two options are needed for each question');
            return question;
          }

          const optionIndexToRemove = question.options.findIndex(option => option._id === o_id);

          const updatedOptions = question.options.filter(option => option._id !== o_id);

          const updatedCorrectAnswers = question.correct_answers
            .filter(answerId => answerId !== optionIndexToRemove + 1)
            .map(answerId => (answerId > optionIndexToRemove + 1 ? answerId - 1 : answerId));

          const reindexedOptions = updatedOptions.map((option, index) => ({ ...option, id: index + 1 }));

          return {
            ...question,
            options: reindexedOptions,
            correct_answers: updatedCorrectAnswers,
          };
        }
        return question;
      });
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleCorrectAnswerChange = (q_id, o_id, checked) => {
    setFormData(prev => {
      const updatedQuestions = prev.questions.map(question => {
        if (question._id === q_id) {
          const optionIndex = question.options.findIndex(option => option._id === o_id);
          let updatedCorrectAnswers = [...question.correct_answers];

          if (checked) {
            if (question.question_type === 'single_correct' && question.correct_answers.length > 0) {
              updatedCorrectAnswers = [optionIndex + 1];
            } else {
              updatedCorrectAnswers.push(optionIndex + 1);
            }
          } else {
            updatedCorrectAnswers = updatedCorrectAnswers.filter(id => id !== optionIndex + 1);
          }

          return { ...question, correct_answers: updatedCorrectAnswers };
        }
        return question;
      });

      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleShowCustomSettings = () => {
    setIsRotated(!isRotated);
    setShowCustomSettings(!showCustomSettings);
  };

  const handleSubmit = event => {
    event.preventDefault();
    setLoading(true);
    const { title, duration, passing_score, questions } = formData;

    if (title === '') {
      toast.error('Title must not be empty');
      setLoading(false);
      return;
    }
    if (title.length > 250) {
      toast.error('Max title chars limit is 250');
      setLoading(false);
      return;
    }

    if (duration && (!Number.isInteger(+duration) || +duration < 30 || +duration > 36000)) {
      toast.error('Duration must be an integer between 30 and 36000 seconds or null.');
      setLoading(false);
      return;
    }
    if (passing_score && (+passing_score > 100 || +passing_score < 0)) {
      toast.error('Passing score must be between 0 and 100 or exactly 0.');
      setLoading(false);
      return;
    }
    if (!Number.isInteger(+passing_score)) {
      toast.error('Passing score must be an integer.');
      setLoading(false);
      return;
    }

    for (const question of questions) {
      if (question.question_text.trim() === '') {
        toast.error('Question text cannot be empty.');
        setLoading(false);
        return;
      }
      if (question.question_type !== 'subjective' && question.options.some(option => ["", null, undefined].includes(option.text))) {
        toast.error("Any option text cannot be empty.");
        setLoading(false);
        return;
      }
      if (question.question_type !== 'subjective' && question.correct_answers.length === 0) {
        toast.error("At least one correct answer required for each MCQ question.");
        setLoading(false);
        return;
      }
    }

    const processedData = {
      ...formData,
      theme: formData['theme'] ? formData['theme'] : 'autumn',
      duration: formData.duration ? +formData.duration : null
    };
    console.log(processedData);
    setLoading(true);
    axios.put('/api/quiz/edit/' + quizid, processedData)
      .then(response => {
        toast.success(response.data.message);
        if (response.data.success) {
          $.confirm({
            title: 'Quiz Updated!',
            content: `<p style="padding: 10px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;" class="form-control">Quiz has been successfully updated</p>`,
            buttons: {
              'cancel': {
                text: 'Cancel',
                btnClass: 'px-2',
              },
              'copy': {
                text: 'Copy',
                btnClass: 'px-2',
                action: function () {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`${window.location.origin}/dashboard/quiz/${quizid}/view`).then(() => {
                      toast.success('Quiz link copied to clipboard!');
                    }).catch((e) => {
                      console.log(e);
                      toast.error('Error copying');
                    });
                  } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = `${window.location.origin}/dashboard/quiz/${quizid}/view`;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      toast.success('Quiz link copied to clipboard!');
                    } catch (e) {
                      console.log(e);
                      toast.error('Error copying');
                    }
                    document.body.removeChild(textArea);
                  }
                }
              },
              'home': {
                text: 'Home',
                btnClass: 'px-2',
                action: function () {
                  router.push('/dashboard');
                }
              },
            },
            useBootstrap: true,
            theme: 'supervan'
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setFormData(prevData => ({ ...prevData }));
  }, []);

  function fetchQuizDetails(qId) {
    axios.get('/api/quiz/edit/' + qId).then(res => {
      setFormData(res.data.quiz);
      setDataStatus(1);
    }).catch((error) => {
      setDataStatus(-1);
      console.log(error);
      setDataMsg(error?.response?.data?.message || error?.message);
    });
  }

  useEffect(() => {
    fetchQuizDetails(params.quizid);
  }, []);

  const handleAiFormChange = (event) => {
    const { name, type, checked } = event.target;

    if (type === 'checkbox') {
      setAiFormData((prevData) => {
        
        if(['single_correct', 'multi_correct', 'subjective'].includes(name)){
        const updatedType = checked
          ? [...prevData.type, name]
          : prevData.type.filter((item) => item !== name);
          return {
          ...prevData,
          type: updatedType,
        };
        }
        const newCheckState = {
          ...prevData,
          [name]: checked
        }
        return newCheckState
        
      });
    } else {
      setAiFormData((prevData) => ({
        ...prevData,
        [name]: event.target.value,
      }));
    }
  };

  const handleGenerateQuestions = () => {
    setAddQuestionsLoading(true);
    try {
      const description = aiFormData.useExistingTopic ? formData.description : aiFormData.description;

      const aiData = {
        oldQuestions: formData.questions.map(question => question.question_text) || [],
        description: description,
        level: aiFormData.level ? aiFormData.level : "Medium",
        type: aiFormData.type.length > 0 ? aiFormData.type : ['single_correct'],
        language: aiFormData.language || "English",
        total_questions: parseInt(aiFormData.total_questions) || 1
      };
      console.log(aiData);
      if (aiData.description.length > 5000) {
        toast.error('Description must be less than 5000 characters');
        setAddQuestionsLoading(false);
        return null;
      }
      if (aiData.total_questions > 30 || aiData.total_questions < 1) {
        toast.error('Total number of questions must be between 1 and 30');
        setAddQuestionsLoading(false);
        return null;
      }
      axios.post('/api/quiz/edit/add/questions', aiData).then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          setFormData(prev => ({ ...prev, questions: [...prev.questions, ...res.data.questions] }));
          setAiModalVisible(false);
          setAiFormData({
            useExistingTopic: true,
            description: '',
            type: ['single_correct'],
            level: 'Easy',
            language: 'English',
            total_questions: 1,
          });
        } else {
          toast.error(res.data.message || 'Failed to generate questions');
        }
      }).catch((e) => {
        console.error(e);
        toast.error(e.response?.data?.message || e?.message);
      }).finally(() => {
        setAddQuestionsLoading(false);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {aiModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm p-2 z-40 overflow-hidden">
          <div className="bg-neutral-content dark:bg-neutral shadow-md shadow-neutral rounded-lg py-5 px-4 w-full max-w-xs relative z-30 overflow-auto">
            <button
              onClick={() => setAiModalVisible(false)}
              className="absolute top-2.5 right-2.5"
            >
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-2 mt-1.5">Generate Questions with AI</h2>
            <div className="space-y-2">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-neutral dark:text-neutral-content text-sm">
                  Use Existing Quiz Topic and Details
                </span>
                <input
                  type="checkbox"
                  name="useExistingTopic"
                  className="toggle toggle-primary"
                  checked={aiFormData.useExistingTopic}
                  onChange={(e) => {
                    handleAiFormChange(e);
                    if (e.target.checked) { 
                      setAiFormData(prev => ({ ...prev, description: formData.description }));
                    } else {
                      setAiFormData(prev => ({ ...prev, description: '' }));
                    }
                  }}
                />
              </label>
              {!aiFormData.useExistingTopic && (
                <div className='relative'>
                  <textarea
                    name="description"
                    ref={aiTextareaRef}
                    value={aiFormData.description}
                    onChange={handleAiFormChange}
                    placeholder="Enter new topic or description (max 5000 chars)"
                    className="textarea textarea-bordered border-neutral text-xs w-full h-24 pe-[3.1rem] max-w-xs mb-1"
                    maxLength="5000"
                  ></textarea>
                  <div className="absolute right-1.5 bottom-4">
                    <Mic micActive={listening} handleMic={handleMic} className="h-[30px] w-[30px]" micClassName="text-[1rem]" />
                  </div>
                </div>
              )}
              <div className="type">
                <p className='mb-1 text-neutral dark:text-neutral-content text-xs'>Type</p>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="btn btn-sm"
                    type="checkbox"
                    name="single_correct"
                    aria-label="Single Correct"
                    checked={aiFormData.type.includes('single_correct')}
                    onChange={handleAiFormChange}
                  />
                  <input
                    className="btn btn-sm"
                    type="checkbox"
                    name="multi_correct"
                    aria-label="Multi Correct"
                    checked={aiFormData.type.includes('multi_correct')}
                    onChange={handleAiFormChange}
                  />
                  <input
                    className="btn btn-sm"
                    type="checkbox"
                    name="subjective"
                    aria-label="Subjective"
                    checked={aiFormData.type.includes('subjective')}
                    onChange={handleAiFormChange}
                  />
                </div>
              </div>
              <div className="level mb-2">
                <p className="mb-1 text-neutral dark:text-neutral-content text-xs">Level</p>
                <div className="join">
                  <input
                    className="join-item btn btn-sm"
                    type="radio"
                    name="level"
                    value="Easy"
                    aria-label="Easy"
                    checked={aiFormData.level === 'Easy'}
                    onChange={handleAiFormChange}
                  />
                  <input
                    className="join-item btn btn-sm"
                    type="radio"
                    name="level"
                    value="Medium"
                    aria-label="Medium"
                    checked={aiFormData.level === 'Medium'}
                    onChange={handleAiFormChange}
                  />
                  <input
                    className="join-item btn btn-sm"
                    type="radio"
                    name="level"
                    value="Hard"
                    aria-label="Hard"
                    checked={aiFormData.level === 'Hard'}
                    onChange={handleAiFormChange}
                  />
                </div>
              </div>
              <label className="input input-sm input-bordered border-neutral flex items-center gap-1 text-xs w-full max-w-xs mt-1">
                Language
                <select
                  className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-none text-neutral dark:text-neutral-content text-xs select-sm ms-1"
                  name="language"
                  value={aiFormData.language}
                  onChange={handleAiFormChange}
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
              <label className="input input-sm input-bordered border-neutral flex items-center gap-1 text-xs w-full max-w-xs mt-1">
                Questions
                <input
                  type="number"
                  name="total_questions"
                  className="grow text-xs input-sm"
                  placeholder="Default 10"
                  title='Number of questions must be between 1 and 30.'
                  value={aiFormData.total_questions}
                  onChange={handleAiFormChange}
                />
              </label>
            </div>
            <div className='w-full flex justify-center'>
            <button
              onClick={handleGenerateQuestions}
              className="btn btn-primary btn-sm mt-4 disabled:text-base-100 disabled:bg-primary"
              disabled={addQuestionsLoading}
            >
              {addQuestionsLoading ? (
                <>
                  <RiLoader2Fill className="animate-spin" /> Generating...
                </>
              ) : (
                <> <BsStars /> Generate </>
              )}
            </button>
            </div>
          </div>
        </div>
      )}
      
      {formData._id && (
        <div className="px-1 py-3 w-full flex justify-center">
          <form
            className="mt-1 px-2 flex flex-col justify-center items-start w-full gap-y-3 mb-10 max-w-sm"
            onSubmit={handleSubmit}
          >
            <h1 className="font-bold text-primary text-xl px-2">Edit Quiz</h1>
            <div className="w-full">
              <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
                Title
                <input
                  type="text"
                  placeholder="Title (Optional)"
                  name="title"
                  className="text-sm w-full"
                  maxLength="250"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>
              {titleErrMsg && (
                <p className="text-error text-sm text-end mt-1">{titleErrMsg}</p>
              )}
            </div>

            <div className="level">
              <p className="mb-1.5 text-neutral dark:text-neutral-content text-sm">Level</p>
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

            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-2">
              Visibility
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>

            <label className="input input-bordered border-neutral flex items-center gap-2 w-full max-w-sm text-sm mt-2">
              Passing
              <input
                type="number"
                name="passing_score"
                className="text-sm w-full"
                placeholder="% (Optional)"
                value={formData.passing_score}
                onChange={handleChange}
              />
            </label>

            <label className="label cursor-pointer gap-6">
              <span className="label-text text-neutral dark:text-neutral-content">
                Shuffle Questions
              </span>
              <input
                type="checkbox"
                name="shuffle_question"
                className="toggle toggle-primary"
                checked={formData.shuffle_question}
                onChange={handleChange}
              />
            </label>

            <label className="label cursor-pointer gap-6">
              <span className="label-text text-neutral dark:text-neutral-content">
                Shuffle Options
              </span>
              <input
                type="checkbox"
                name="shuffle_option"
                className="toggle toggle-primary"
                checked={formData.shuffle_option}
                onChange={handleChange}
              />
            </label>

            <label
              className="w-full flex flex-nowrap flex-row justify-between mt-4"
              onClick={handleShowCustomSettings}
            >
              <span className="text-primary text-sm select-none underline">More Settings</span>
              <IoMdSettings
                className={`text-primary text-2xl transition-transform duration-200 ${
                  isRotated ? 'rotate-90 mb-1.5' : ''
                }`}
              />
            </label>

            {showCustomSettings && (
              <>
                <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
                  Duration
                  <input
                    type="number"
                    name="duration"
                    className="grow text-sm"
                    placeholder="Skip for no limit (in s)"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </label>

                <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-1">
                  Language
                  <select
                    className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content"
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

                <div className="theme w-full">
                  <p className="mb-1.5 text-neutral dark:text-neutral-content text-sm">
                    Choose theme
                  </p>
                  <div className="flex flex-row gap-x-4 flex-nowrap overflow-x-scroll max-w-sm rounded-md py-3 px-4 bg-gray-300 dark:bg-gray-800">
                    {themes.map((theme, index) => (
                      <label
                        className="flex flex-col justify-center items-center gap-y-3"
                        key={index}
                      >
                        <div className="rounded" data-theme={theme}>
                          <div className="                         flex justify-between items-center w-auto h-10 px-1.5 gap-x-4">
                            <p className="text-sm">{theme}</p>
                            <div className="flex justify-evenly gap-1">
                              <div className="h-8 w-2 bg-primary rounded-md"></div>
                              <div className="h-8 w-2 bg-secondary rounded-md"></div>
                              <div className="h-8 w-2 bg-accent rounded-md"></div>
                              <div className="h-8 w-2 bg-neutral rounded-md"></div>
                            </div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          value={theme}
                          name="theme"
                          className="radio radio-sm"
                          onChange={handleChange}
                          checked={formData.theme === theme}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="py-3 bg-gray-300 dark:bg-gray-800 rounded-md px-3">
              <div className="flex flex-row items-center gap-x-2">
                <h2 className="mt-1 mb-2 font-bold text-primary text-xl">Questions</h2>
                <button
                  type="button"
                  onClick={() => setAiModalVisible(true)}
                  className="btn btn-primary btn-sm rounded-full text-white px-3 flex flex-row items-center gap-x-2"
                >
                  <BsStars /> Add Questions with AI
                </button>
              </div>

              {formData.questions && formData.questions.map((question, index) => (
  <div key={question._id} className=" mb-5 mt-3 relative flex flex-row justify-between gap-x-2 w-full max-w-sm">
  <div className="collapse collapse-arrow border border-base-500 rounded-md">
    <input type="checkbox" className="peer" />
    <div className="collapse-title flex flex-row items-center justify-between w-full">
      <h3 className="font-bold text-primary text-ellipsis overflow-hidden">{question?.question_text || 'Question ' + (index+1)}</h3>
    </div>
    <div className="collapse-content">
      <input
        className="input input-bordered border-neutral text-sm w-full max-w-sm mb-2 mt-1"
        type="text"
        placeholder="Enter Question"
        value={question.question_text}
        onChange={(e) => handleQuestionChange(e, question._id)}
      />

      <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm my-1">
        Question Type
        <select
          className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content"
          name="question_type"
          value={question.question_type}
          onChange={(e) => {
            const newTypeValue = e.target.value;
            setFormData((prev) => ({
              ...prev,
              questions: prev.questions.map((q) => {
                if (q._id === question._id) {
                  if (newTypeValue === 'subjective' && (q.question_type === 'single_correct' || q.question_type === 'multi_correct')) {
                    return {
                      ...q,
                      question_type: newTypeValue,
                      correct_answers: [''],
                      options: []
                    };
                  } else if ((newTypeValue === 'single_correct' || newTypeValue === 'multi_correct') && q.question_type === 'subjective') {
                    return {
                      ...q,
                      question_type: newTypeValue,
                      correct_answers: [],
                      options: [
                        { _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 1, text: '' },
                        { _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 2, text: '' }
                      ]
                    };
                  } else if (newTypeValue === 'single_correct' && q.question_type === 'multi_correct') {
                    return {
                      ...q,
                      question_type: newTypeValue,
                      correct_answers: q.correct_answers.length > 0 ? [q.correct_answers[0]] : [],
                    };
                  } else {
                    return {
                      ...q,
                      question_type: newTypeValue,
                    };
                  }
                }
                return q;
              }),
            }));
          }}
        >
          <option value="single_correct">Single Correct</option>
          <option value="multi_correct">Multi Correct</option>
          <option value="subjective">Subjective</option>
        </select>
      </label>

      {question.question_type !== 'subjective' ? (
        <div className="mt-1">
          {question.options.map((option, ind) => (
            <div key={option._id} className="mb-1 flex flex-row items-center gap-x-2">
              <input
                className="input input-bordered border-neutral text-sm w-full max-w-sm"
                type="text"
                placeholder={`Option ${ind + 1}`}
                value={option.text}
                onChange={(e) => handleOptionChange(e, question._id, option._id)}
              />
              <label className="label cursor-pointer gap-6">
                <span className="label-text text-neutral dark:text-neutral-content">
                  Correct
                </span>
                <input
                  type="checkbox"
                  name="correct_answer"
                  className="toggle toggle-primary"
                  checked={question.correct_answers.includes(option.id)}
                  onChange={(e) =>
                    handleCorrectAnswerChange(question._id, option._id, e.target.checked)
                  }
                />
              </label>
              <AiOutlineMinusCircle
                className="text-6xl text-error cursor-pointer"
                onClick={() => handleRemoveOption(question._id, option._id)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddOption(question._id)}
            className="btn btn-success btn-sm rounded-full text-white px-3 flex flex-row items-center gap-x-2 mb-2"
          >
            <AiOutlinePlusCircle /> Add Option
          </button>
        </div>
      ) : (
        <textarea
          className="textarea textarea-bordered border-neutral text-sm w-full h-32 max-w-sm mb-1 mt-1 pe-[3.1rem]"
          placeholder="Enter the correct answer"
          value={question.correct_answers[0]}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              questions: prev.questions.map(q =>
                q._id === question._id ? { ...q, correct_answers: [e.target.value] } : q
              )
            }))
          }
        ></textarea>
      )}

      <label>
        <span className="text-sm font-bold">Reason for correct answer</span>
        <textarea
          className="textarea textarea-bordered border-neutral text-sm w-full h-32 max-w-sm mb-1 mt-1 pe-[3.1rem]"
          placeholder="Reason (Optional)"
          value={question.reason}
          onChange={(e) => handleReasonChange(e, question._id)}
        ></textarea>
      </label>
    </div>
  </div>
  <div className="pt-4">
      <AiOutlineMinusCircle
        onClick={() => handleRemoveQuestion(question._id)}
        className="text-3xl text-error cursor-pointer"
      />
    </div>
  </div>
))}
              
              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn btn-success btn-sm rounded-full text-white px-3 flex flex-row items-center gap-x-2 mb-2"
              >
                <AiOutlinePlusCircle /> Add Question
              </button>
            </div>

            <div className="mx-auto mt-4">
              <button
                type="submit"
                className="btn btn-primary disabled:text-base-100 disabled:bg-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    {' '}
                    <RiLoader2Fill className="animate-spin" /> Saving{' '}
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {dataStatus === 0 ? (
        <div
          role="alert"
          className="alert alert-info mx-auto w-3/4 max-w-sm absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2"
        >
          <RiLoader2Fill className="animate-spin text-sm" />
          <span className="text-sm">{dataMsg}</span>
        </div>
      ) : dataStatus === -1 ? (
        <div className=" mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 text-center">
          <div role="alert" className="alert alert-error w-full max-w-sm">
            <MdErrorOutline className='text-xl' />
            <span className="text-sm">{dataMsg}</span>
          </div>
          <br />
          <br />
          <Link href="/" className="underline underline-offset-3 text-info">
            Go to home
          </Link>
        </div>
      ) : (
        ''
      )}
    </>
  );
}