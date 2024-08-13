'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IoMdSettings } from "react-icons/io";
import axios from 'axios';
import { RiLoader2Fill } from "react-icons/ri";

export default function Page() {
  const router = useRouter();

  const [isRotated, setIsRotated] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_questions: '10',
    visibility: 'public',
    level: 'Medium',
    type: 'single_correct',
    single_correct: 'checked',
    multi_correct: '',
    category: '',
    duration: '',
    passing_score: '',
    language: 'English',
    shuffle_question: false,
    shuffle_option: false,
    theme: "autumn"
  });
  
  const themes = [
      "autumn",
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
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

  const maxChars = 5000;
  const remainingChars = maxChars - formData.description.length;

  const handleChange = (event) => {
    const { name, type, checked } = event.target;

    if (type === 'checkbox') {
      setFormData((prevData) => {
        const newCheckboxState = {
          ...prevData,
          [name]: checked
        };

        const newTypeValue = newCheckboxState.single_correct && newCheckboxState.multi_correct
          ? 'mixed'
          : newCheckboxState.single_correct
            ? 'single_correct'
            : newCheckboxState.multi_correct
              ? 'multi_correct'
              : '';

        return {
          ...newCheckboxState,
          type: newTypeValue
        };
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
    const { total_questions, duration, passing_score, description } = formData;
    
    if(!description){
      toast.error('Quiz description is required for creating quizes.')
      setLoading(false)
      return
    }
    if(description.length < 10){
      toast.error('Atleast 10 characters required for quiz description.')
      setLoading(false)
      return;
    }

    if (total_questions !== '' && (!Number.isInteger(+total_questions) || +total_questions < 1 || +total_questions > 30)) {
  toast.error('Number of questions must be an integer between 1 and 30.');
  setLoading(false)
  return;
}
    if (duration && (!Number.isInteger(+duration) || +duration < 30 || +duration > 36000)) {
      toast.error('Duration must be an integer between 30 and 36000 seconds or null.');
      setLoading(false)
      return;
    }
    
    if (passing_score &&  (+passing_score > 100 || +passing_score < 0)) {
      toast.error('Passing score must be between 0 and 100 or exactly 0.');
      setLoading(false)
      return;
    }
    if(!Number.isInteger(+passing_score)){
        toast.error('Passing score must be an integer.');
        setLoading(false)
      return;
      }
      
    const processedData = {
      ...formData,
      total_questions: formData.total_questions ? parseInt(+formData.total_questions) : 10,
      type: formData['type'] ? formData['type'] : 'single_correct',
      theme: formData['theme'] ? formData['theme'] : 'autumn',
      duration: formData.duration ? +formData.duration : null
    };

    setLoading(true)
   axios.post('/api/quiz', processedData)
  .then(response => {
    setLoading(false);
    toast.success(response.data.message);
    if(response.data.success){
      router.push(`/dashboard/quiz/${response.data.data.quizId}/edit`)
    }
  })
  .catch(error => {
    setLoading(false);
    toast.error(error.response.data.message);
  })
  .finally(() => {
    setLoading(false);
  });
  };

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      level: 'Medium'
    }));
  }, []);

  return (
    <div className='p-4'>
      <h1 className='font-bold text-primary text-xl px-2'>Create Quiz</h1>
      <form className='mt-4 px-2 flex flex-col justify-center items-start w-full gap-y-3 mb-10' onSubmit={handleSubmit}>
        
        <label className="input input-bordered border-neutral flex items-center gap-2 text-sm w-full max-w-sm mt-1">
          Title
          <input
          type="text"
          placeholder="Title (Optional)"
          name="title"
          className="text-sm"
          maxLength='250'
          value={formData.title}
          onChange={handleChange}
        />
        </label>

        <label className="w-full max-w-sm mt-1">
          <span className="block mb-1.5 text-neutral dark:text-neutral-content text-sm">Describe your topic (Required)</span>
          <textarea
            placeholder="Describe your topic"
            name='description'
            className="textarea textarea-primary textarea-bordered border-neutral w-full"
            value={formData.description}
            onChange={handleChange}
            maxLength={maxChars}
          ></textarea>
          <p className='text-sm text-neutral dark:text-neutral-content'>{remainingChars}/{maxChars} characters remaining</p>
        </label>

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
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content"
                name='visibility'
                value={formData.visibility}
                onChange={handleChange}
              >
                 <option value="public">Public</option>
                 <option value="private">Private</option>
              </select>
            </label>
        

        <div className="level">
          <p className='mb-1.5 text-neutral dark:text-neutral-content text-sm'>Level</p>
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

        <label className='w-full flex flex-nowrap flex-row justify-between mt-4' onClick={handleShowCustomSettings}>
          <span className='text-primary text-sm select-none underline'>More Settings</span>
          <IoMdSettings
            className={`text-primary text-2xl transition-transform duration-200 ${isRotated ? 'rotate-90 mb-1.5' : ''}`}
          />
        </label>

        {showCustomSettings && (
          <>
            <div className="type">
  <p className='mb-1.5 text-neutral dark:text-neutral-content text-sm'>Type (MCQs)</p>
  <div className="join">
    <input
      className="join-item btn"
      type="checkbox"
      name="single_correct"
      aria-label="Single Correct"
      checked={formData.single_correct}
      onChange={handleChange}
    />
    <input
      className="join-item btn"
      type="checkbox"
      name="multi_correct"
      aria-label="Multi Correct"
      checked={formData.multi_correct}
      onChange={handleChange}
    />
  </div>
</div>

            <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm mt-1">
              Category
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-neutral dark:text-neutral-content"
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
                className="grow text-sm"
                placeholder="Skip for no limit (in s)"
                value={formData.duration}
                onChange={handleChange}
              />
            </label>

                <label className="input input-bordered border-neutral flex items-center gap-2 w-full max-w-sm text-sm mt-1">
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

            <label className="label cursor-pointer gap-6">
              <span className="label-text text-neutral dark:text-neutral-content">Shuffle Questions</span>
              <input
                type="checkbox"
                name="shuffle_question"
                className="toggle toggle-primary"
                checked={formData.shuffle_question}
                onChange={handleChange}
              />
            </label>

            <label className="label cursor-pointer gap-6">
              <span className="label-text text-neutral dark:text-neutral-content">Shuffle Options</span>
              <input
                type="checkbox"
                name="shuffle_option"
                className="toggle toggle-primary"
                checked={formData.shuffle_option}
                onChange={handleChange}
              />
            </label>
            <div class="theme w-full">
            <p className='mb-1.5 text-neutral dark:text-neutral-content text-sm'>Choose theme</p>
            <div className='flex flex-row gap-x-4 flex-nowrap overflow-x-scroll max-w-sm rounded-md py-3 px-4 bg-neutral hide-scrollbar'>
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

        <div className='mx-auto mt-4'>
          <button type="submit" className='btn btn-primary disabled:text-base-100 disabled:bg-primary' disabled={loading}>
          {
            loading ?
             (
              <>
              <RiLoader2Fill className='animate-spin' />
              Creating
              </>
              ) : 'Create Quiz'
          }
          </button>
        </div>
      </form>
    </div>
  );
}