'use client';
import { useState } from 'react';
import axios from 'axios';
import showToast from '@/components/showToast'
import Link from "next/link"
import { useRouter } from 'next/navigation';
import SocialSigninButton from '@/components/socialSignin/socialSignin'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setloading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setloading(true)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailRegex.exec(formData.email)){
    showToast.error("Invalid email")
    setloading(false)
    return;
  }
  try {
    const res = await axios.post('/api/register', JSON.stringify(formData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if(res.data.success){
      setFormData({
    name: '',
    email: '',
    password: '',
  })
    router.push('/login');
    }
    showToast.success(res.data.message)
  } catch (error) {
    showToast.error(error.response.data.message);
  } finally{
  setloading(false)
  }
};


  return (
    <div className='min-h-screen pt-7 w-full flex justify-center'>
      <form className='flex flex-col items-center justify-start md:justify-center w-full max-w-sm gap-y-4 px-4 pb-8' onSubmit={handleSubmit}>
      <h1 className='text-center font-bold mb-5 text-2xl'>Signup at QuizAI</h1>

          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Name
            <input type="text" className="grow" placeholder="" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required />
          </label>
          
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
          loading ? 'Please wait' : 'Signup'
        }</button>
        <p className='text-center'>or</p>
        <SocialSigninButton />
        <p className='text-center mt-6 text-blue-600'><Link href="/password/reset">Forgot password?</Link></p>
        <Link href='/login' className='btn btn-neutral btn-outline rounded-full mt-6 px-12' type="button">Login</Link>
      </form>
    </div>
  );
}