'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IoMdSettings } from "react-icons/io";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import Link from 'next/link'
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import $ from 'jquery';
import dynamic from 'next/dynamic';


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
  const {quizid} = params
  const [url, setUrl] = useState(`${window.location.protocol}//${window.location.host}/dashboard/quiz/${quizid}/view`);
  useJQueryConfirm();
  
  const [isRotated, setIsRotated] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleErrMsg, setTitleErrMsg] = useState('')
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
  const [dataStatus, setDataStatus] = useState(0)
  const [dataMsg, setDataMsg] = useState('Loading quiz data, please hold on...')
  

  const themes = [
    "autumn", "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "business", "acid", "lemonade", "night", "coffee", "winter", "dim", "nord", "sunset",
  ];
  const categories = [
    { value: "art", text: "Art" }, { value: "business", text: "Business" }, { value: "comics", text: "Comics" }, { value: "current_events", text: "Current Events" }, { value: "economics", text: "Economics" }, { value: "entertainment", text: "Entertainment" }, { value: "food", text: "Food" }, { value: "general_knowledge", text: "General Knowledge" }, { value: "geography", text: "Geography" }, { value: "history", text: "History" }, { value: "languages", text: "Languages" }, { value: "literature", text: "Literature" }, { value: "math", text: "Math" }, { value: "movies", text: "Movies" }, { value: "music", text: "Music" }, { value: "mythology", text: "Mythology" }, { value: "nature", text: "Nature" }, { value: "philosophy", text: "Philosophy" }, { value: "politics", text: "Politics" }, { value: "psychology", text: "Psychology" }, { value: "religion", text: "Religion" }, { value: "science", text: "Science" }, { value: "space", text: "Space" }, { value: "sports", text: "Sports" }, { value: "technology", text: "Technology" }
  ];

  const handleChange = (event) => {
    const { name, type, checked } = event.target;
    if (type === 'checkbox') {
      setFormData(prevData => ({...prevData, [name]: checked}));
    } else {
      if(name == 'title'){
        if(event.target.value.length <= 250){
          setFormData(prevData => ({ ...prevData, [name]: event.target.value }));
        }else{
          setTitleErrMsg('Max title length limit is 250 chars')
        }
      }else{
        setFormData(prevData => ({ ...prevData, [name]: event.target.value }));
      }
    }
  };

  const handleQuestionChange = (e, q_id) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.map(question => question._id === q_id ? { ...question, question_text: e.target.value } : question) }));
  };

  const handleOptionChange = (e, q_id, o_id) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.map(question => question._id === q_id ? { ...question, options: question.options.map(option => option._id === o_id ? { ...option, text: e.target.value } : option) } : question) }));
  };
  
  const handleReasonChange = (e, q_id) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.map(question => question._id === q_id ? { ...question, reason: e.target.value } : question) }));
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        question_type: formData.single_correct ? "single_correct" : "multi_correct",
        question_text: '',
        options: [{ _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 1, text: '' }, { _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), id: 2, text: '' }],
        correct_answers: [],
        reason: ''
      }]
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
      question._id === q_id ? 
      { 
        ...question, 
        options: [...question.options, { 
          _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 
          id: question.options.length + 1, // Assign id sequentially
          text: '' 
        }] 
      } : 
      question
    ) 
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

        // Find the index of the option to be removed
        const optionIndexToRemove = question.options.findIndex(option => option._id === o_id);

        // Filter out the option to be removed
        const updatedOptions = question.options.filter(option => option._id !== o_id);

        // Update correct_answers
        const updatedCorrectAnswers = question.correct_answers
          .filter(answerId => answerId !== optionIndexToRemove + 1)
          .map(answerId => (answerId > optionIndexToRemove + 1 ? answerId - 1 : answerId));

        // Update the ids for the remaining options
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
    
    if(title == ''){
      toast.error('Title must not be empty')
      setLoading(false)
      return
    }
    if(title.length > 250){
      toast.error('Max title chars limit is 250')
      setLoading(false)
      return
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
      if(question.options.some(option => ["", null, undefined].includes(option.text))){
        toast.error("Any option text cannot be empty.")
        setLoading(false)
        return
      }
    if(question.correct_answers.length == 0){
      toast.error("At least one correct answer required for each question.")
      setLoading(false)
      return
    }
    }

    const processedData = {
      ...formData,
      type: formData['type'] ? formData['type'] : 'single_correct',
      theme: formData['theme'] ? formData['theme'] : 'autumn',
      duration: formData.duration ? +formData.duration : null
    };
    console.log(processedData)
    setLoading(true);
    axios.put('/api/quiz/edit/' + quizid, processedData)
      .then(response => {
        toast.success(response.data.message);
        if (response.data.success) {
          
          $.confirm({
    title: 'Share Quiz!',
    content: `<p style="padding: 10px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;" class="form-control">${url}</p>`,
    buttons: {
        'submit': {
            text: 'Share',
            btnClass: 'btn-primary px-2',
            action: function () {
              if(navigator.share){
                navigator.share({
                  title: formData['title'],
                  text: `Check out this quiz: \n${formData['title']}`,
                  url: url
                }).catch((error) => {
                  console.error('Error sharing', error);
                });
              }
              navigator.clipboard.writeText(url).then(()=>{
                toast.success('Link copied');
              }).catch((e) => {
                console.log(e);
                toast.error('Error copying');
              });
            }
        },
        'cancel': {
          text: 'Cancel',
          btnClass: 'btn px-2',
        },
    },
    useBootstrap: true,
    theme: 'supervan'
});
        }
      })
      .catch((error) => {
        console.log(error)
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
    console.log(e);
    setDataMsg(e?.response?.data?.message || e?.message);
    });
  }

  useEffect(() => {
    fetchQuizDetails(params.quizid);
  }, []);

  return (
    <>
    { formData._id && <>
    <div className='p-4'>
      <h1 className='font-bold text-primary text-xl px-2'>Edit Quiz</h1>
      <form className='mt-4 px-2 flex flex-col justify-center items-start w-full gap-y-3 mb-10' onSubmit={handleSubmit}>
      <div className='w-full'>
        <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
          Title
          <input type="text" placeholder="Title (Optional)" name="title" className="text-sm w-full" maxLength='250' value={formData.title} onChange={handleChange} />
        </label>
          {
            titleErrMsg && <p className='text-error text-sm text-end mt-1'>{titleErrMsg}</p>
          }
          </div>

        <div className="level">
          <p className='mb-1.5 text-neutral dark:text-neutral-content text-sm'>Level</p>
          <div className="join">
            <input className="join-item btn" type="radio" name="level" value="Easy" aria-label="Easy" checked={formData.level === 'Easy'} onChange={handleChange} />
            <input className="join-item btn" type="radio" name="level" value="Medium" aria-label="Medium" checked={formData.level === 'Medium'} onChange={handleChange} />
            <input className="join-item btn" type="radio" name="level" value="Hard" aria-label="Hard" checked={formData.level === 'Hard'} onChange={handleChange} />
          </div>
        </div>

        <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-2">
          Visibility
          <select className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content" name='visibility' value={formData.visibility} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>

        <label className="input input-bordered border-neutral flex items-center gap-2 w-full max-w-sm text-sm mt-2">
          Passing
          <input type="number" name="passing_score" className="text-sm w-full" placeholder="% (Optional)" value={formData.passing_score} onChange={handleChange} />
        </label>

        <label className="label cursor-pointer gap-6">
          <span className="label-text text-neutral dark:text-neutral-content">Shuffle Questions</span>
          <input type="checkbox" name="shuffle_question" className="toggle toggle-primary" checked={formData.shuffle_question} onChange={handleChange} />
        </label>

        <label className="label cursor-pointer gap-6">
          <span className="label-text text-neutral dark:text-neutral-content">Shuffle Options</span>
          <input type="checkbox" name="shuffle_option" className="toggle toggle-primary" checked={formData.shuffle_option} onChange={handleChange} />
        </label>

        <label className='w-full flex flex-nowrap flex-row justify-between mt-4' onClick={handleShowCustomSettings}>
          <span className='text-primary text-sm select-none underline'>More Settings</span>
          <IoMdSettings className={`text-primary text-2xl transition-transform duration-200 ${isRotated ? 'rotate-90 mb-1.5' : ''}`} />
        </label>

        {showCustomSettings && (
          <>
            <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
              Duration
              <input type="number" name="duration" className="grow text-sm" placeholder="Skip for no limit (in s)" value={formData.duration} onChange={handleChange} />
            </label>

            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-1">
              Language
              <select className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content" name="language" value={formData.language} onChange={handleChange}>
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
              <p className='mb-1.5 text-neutral dark:text-neutral-content text-sm'>Choose theme</p>
              <div className='flex flex-row gap-x-4 flex-nowrap overflow-x-scroll max-w-sm rounded-md py-3 px-4 bg-gray-300 dark:bg-gray-800'>
                {themes.map((theme, index) => (
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
                    <input type="radio" value={theme} name="theme" className="radio radio-sm" onChange={handleChange} checked={formData.theme === theme} />
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        <div className='py-3 bg-gray-300 dark:bg-gray-800 rounded-md px-3'>
        <h2 className='mt-1 mb-2 font-bold text-primary text-xl'>Questions</h2>
        {formData.questions && formData.questions.map((question, index) => (
          <div key={question._id} className='mb-5'>
            <div className="flex flex-row items-center justify-between w-full">
              <h3 className='font-bold text-primary mb-1'>Question {index + 1}</h3>
              <div>
                  <AiOutlineMinusCircle onClick={() => handleRemoveQuestion(question._id)} className='text-3xl mb-1 text-error' />
                
              </div>
            </div>
            
          <div className='border-b-2 border-t-2 border-neutral rounded-md pt-2 mt-1'>
            <input className='input input-bordered border-neutral text-sm w-full max-w-sm mb-2' type="text" value={question.question_text} onChange={e => handleQuestionChange(e, question._id)} />
            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm my-1">
              Question Type
              <select className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content" name="question_type" value={question.question_type} onChange={e => {
                const newTypeValue = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  questions: prev.questions.map(q => {
                    if (q._id === question._id) {
                      const updatedCorrectAnswers = newTypeValue === 'single_correct' && q.correct_answers.length > 1 ? [q.correct_answers[0]] : q.correct_answers;
                      return { ...q, question_type: newTypeValue, correct_answers: updatedCorrectAnswers };
                    }
                    return q;
                  })
                }));
              }}>
                <option value="single_correct">Single Correct</option>
                <option value="multi_correct">Multi Correct</option>
              </select>
            </label>
            <div className='mt-1'>
              {question.options.map((option, ind) => (
                <div key={option._id} className="mb-1 flex flex-row items-center gap-x-2">
                  <input className='input input-bordered border-neutral text-sm w-full max-w-sm' type="text" value={option.text} onChange={e => handleOptionChange(e, question._id, option._id)} />
                  <label className="label cursor-pointer gap-6">
                    <span className="label-text text-neutral dark:text-neutral-content">Correct</span>
                    <input type="checkbox" name="correct_answer" className="toggle toggle-primary" checked={question.correct_answers.includes(option.id)} onChange={e => handleCorrectAnswerChange(question._id, option._id, e.target.checked)} />
                  </label>
                    <AiOutlineMinusCircle className='text-6xl text-error' onClick={() => handleRemoveOption(question._id, option._id)} />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => handleAddOption(question._id)} className='btn btn-success btn-sm rounded-full text-white px-3 flex flex-row items-center gap-x-2 mb-2'>
              <AiOutlinePlusCircle /> Add Option
            </button>
            <label>
            <span className='text-sm font-bold'>Reason for correct answer</span>
            <textarea className='textarea textarea-bordered border-neutral text-sm w-full h-32 max-w-sm mb-1 mt-1' type="text" value={question.reason} onChange={e => handleReasonChange(e, question._id)} placeholder="Reason (Optional)" > </textarea>
            </label>
          </div>
          </div>
        ))}
        <button type="button" onClick={handleAddQuestion} className='btn btn-success btn-sm rounded-full text-white px-3 flex flex-row items-center gap-x-2'>
          <AiOutlinePlusCircle /> Add Question
        </button>
        </div>
        <div className='mx-auto mt-4'>
          <button type="submit" className='btn btn-primary disabled:text-base-100 disabled:bg-primary' disabled={loading}>
            {loading ? <> <RiLoader2Fill className='animate-spin' /> Saving </> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
    </>
    }
    {
        dataStatus == 0 ? (
         <div role="alert" className="alert alert-info mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2">
          <RiLoader2Fill className='animate-spin' />
  <span className='text-sm'>{dataMsg}</span>
</div>
          ) : (
          dataStatus == -1 ? (
            <div className=' mx-auto w-3/4 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 text-center'>
            <div role="alert" className="alert alert-error w-full">
              <MdErrorOutline />
              <span className='text-sm'>{dataMsg}</span>
            </div>
            <br />
            <br />
            <Link href='/' className='underline underline-offset-3 text-info'>Go to home</Link>
            </div>
            ): ''
        )
      }
    </>
  );
}