'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import SocialSigninButton from '@/components/socialSignin/socialSignin'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setloading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setloading(true)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailRegex.exec(formData.email)){
    toast.error("Invalid email")
    setloading(false)
    return;
  }
  try {
    const res = await axios.post('/api/login', JSON.stringify(formData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if(res.data.success){
      setFormData({
    email: '',
    password: '',
  })
  router.push('/home');
    }
    toast.success(res.data.message)
  } catch (error) {
    console.log(error)
    toast.error(error.response.data.message);
  } finally{
  setloading(false)
  }
};


  return (
    <div>
      <h1 className='text-center font-bold my-7 text-2xl'>Log into QuizAI</h1>
      <form className='flex flex-col items-center gap-y-4 px-4' onSubmit={handleSubmit}>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Email
            <input type="email" className="grow" placeholder="" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
          </label>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Password
            <input type="password" className="grow" placeholder="" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required />
          </label>
        
        <button className='btn btn-neutral rounded-full px-8 mt-4' disabled={loading} type="submit">{
          loading ? 'Please wait' : 'Login'
        }</button>
        <p className='text-center'>or</p>
        <SocialSigninButton />
        <p className='text-center mt-6 text-blue-600'><Link href="/password/reset">Forgot password?</Link></p>
        <Link href='/register' className='btn btn-neutral btn-outline rounded-full mt-6 px-12' type="button">Register</Link>
      </form>
    </div>
  );
}