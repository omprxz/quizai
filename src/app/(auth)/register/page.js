'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from "next/link"
import { redirect } from 'next/navigation';
import checkAuth from '@/utils/checkAuth'

export default function Register() {
  checkAuth('out')
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
    toast.error("Invalid email")
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
  const timer = setTimeout(() => {
      redirect('/login');
    }, 1500);
    }
    toast.success(res.data.message)
  } catch (error) {
    toast.error(error.response.data.message);
  }
  setloading(false)
};


  return (
    <div>
      <h1 className='text-center font-bold my-7 text-2xl'>Signup at QuizAI</h1>
      <form className='flex flex-col items-center gap-y-4 px-4' onSubmit={handleSubmit}>

          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">Name
            <input type="text" className="grow" placeholder="" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required />
          </label>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">Email
            <input type="email" className="grow" placeholder="" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
          </label>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">Password
            <input type="password" className="grow" placeholder="" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required />
          </label>
        
        <button className='btn btn-neutral rounded-full px-8 mt-4' disabled={loading} type="submit">{
          loading ? 'Please wait' : 'Signup'
        }</button>
        <p className='text-center mt-2 text-blue-600'><Link href="/password/reset">Forgot password?</Link></p>
        <Link href='/login' className='btn btn-neutral btn-outline rounded-full mt-14 px-12' type="button">Login</Link>
      </form>
    </div>
  );
}