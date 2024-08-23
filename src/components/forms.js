'use client'
import {useState, useEffect} from 'react';
import showToast from '@/components/showToast'
import axios from 'axios'
import { useRouter, usePathname } from 'next/navigation'

export function Feedback({setFbOpen = false}){
  const router = useRouter()
  const pathname = usePathname()
  const feedbackCategories = [
    "User Experience",
    "Quiz Accuracy",
    "Result Evaluation",
    "AI Performance",
    "Design",
    "Feature Requests",
    "Others"
];
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    category: feedbackCategories[0],
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [loggedIn, setLoggedIn] = useState(true)
  useEffect(() => {
    if(localStorage.getItem('authToken')){
      setLoggedIn(true)
    }else{
      setLoggedIn(false)
    }
  }, [router, pathname])

  const handleChange = (e) => {
    const {name, value} = e.target
    setFeedbackData((prev) => ({...prev, [name]: value}))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if(!loggedIn){
      if(!feedbackData.name){
        showToast.warning('Provide your name.')
        return
      }
      if(!feedbackData.email){
        showToast.warning('Provide your email.')
        return
      }
    }
    if(!feedbackData.category){
      showToast.warning('Category can\'t be empty.')
      return
    }
    if(!feedbackData.message){
      showToast.warning('Message can\'t be empty.')
      return
    }
    setSending(true)
    axios.post('/api/feedback', {...feedbackData}).then((res) => {
      showshowToast.success(res?.data?.message || 'Feedback saved')
      setFeedbackData({
    name: '',
    email: '',
    category: feedbackCategories[0],
    message: ''
  })
      }).catch((e) => {
        showshowToast.error(e?.response?.data?.message || e?.message || e || 'Something went wrong')
        console.log('Feedback save error:',e)
        }).finally(() => {
          setSending(false)
          if(setFbOpen){
          setFbOpen(false)
          }
          })
  }
  
  return(
    <>
    
      <form className='backdrop-blur-md bg-base-100 w-full max-w-sm flex flex-col justify-center px-4 py-4 rounded-md gap-y-3' onSubmit={handleSubmit}>
      <h1 className='text-xl font-bold my-2 text-center'>Feedback</h1>
       { !loggedIn && ( <> <input type="text" className='input input-bordered' name='name' placeholder='Name' value={feedbackData.name} onChange={handleChange} />
        <input type="email" className='input input-bordered' name='email' placeholder='Email' value={feedbackData.email} onChange={handleChange} /> </> ) }
         <label className="input input-bordered border-neutral flex items-center gap-2 pe-0 text-sm w-full max-w-sm">
              Category
              <select
                className="grow select select-neutral select-bordered border-neutral border-r-0 rounded-bl-none rounded-tl-none text-base-1000"
                name='category'
                value={feedbackData.category}
                onChange={handleChange}
              >
                {
                  feedbackCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                    ))}
              </select>
            </label>
          <textarea name="message" className='textarea textarea-bordered' rows="3" placeholder='Message' value={feedbackData.message} onChange={handleChange}></textarea>
          <div className='flex gap-x-3 justify-center items-center mt-2'>
            { setFbOpen && <button className='btn btn-error rounded-md px-6' type='reset' onClick={() => setFbOpen(false)} >Close</button> }
            <button className='btn btn-primary rounded-md px-6 disabled:bg-primary disabled:text-primary-content' type='submit' disabled={sending}>
            {
              sending ? (
                <span className="loading loading-bars loading-xs"></span>
                ) : 'Send'
            }
            </button>
          </div>
      </form>
    
    </>
    )
}