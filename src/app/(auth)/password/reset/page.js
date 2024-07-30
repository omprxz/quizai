'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from "next/link"
import checkAuth from '@/utils/checkAuth'
import { redirect } from 'next/navigation';

export default function Reset() {
  checkAuth('out')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setloading] = useState(false)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSendOtp = async () => {
  setloading(true)
  if(!formData.email){
    toast.error("Email not provided")
    setloading(false)
    return;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailRegex.exec(formData.email)){
    toast.error("Invalid email")
    setloading(false)
    return;
  }
  try {
    const res = await axios.post('/api/send-reset-otp', JSON.stringify(formData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if(res.data.success){
      setOtpSent(true)
    }
    toast.success(res.data.message)
  } catch (error) {
    toast.error(error.response.data.message);
  }
  setloading(false)
};

const handlePasswordChange = async () => {
  setloading(true)
  try{
    const res = await axios.post('/api/password/reset', JSON.stringify(formData), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if(res.data.success){
      setFormData({
        email: '',
        otp: '',
        newPassword: ''
      })
       const timer = setTimeout(() => {
      redirect('/login');
    }, 1000);
      setOtpSent(false)
    }
    toast.success(res.data.message)
  }catch(e){
    toast.error(e.response.data.message)
  }
  setloading(false)
}

const handleClick = async () => {
  if(otpSent){
    handlePasswordChange()
  }else{
    handleSendOtp()
  }
}


  return (
    <div>
      <h1 className='text-center font-bold my-7 text-2xl'>Reset Password</h1>
      <form className='flex flex-col items-center gap-y-4 px-4'>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">Email
            <input type="email" disabled={otpSent} className="grow" placeholder="" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
          </label>
          { otpSent && (
            <>
          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">OTP
            <input type="number" className="grow" placeholder="" 
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required />
          </label>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full max-w-sm">Password
            <input type="password" className="grow" placeholder="" 
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required />
          </label>
          </>
          )
          }
        
        <button className='btn btn-neutral px-5 mt-4 rounded-full' disabled={loading} type="button" onClick={handleClick}>{loading ? 'Please wait' : (otpSent ? 'Reset Password' : 'Send OTP')}</button>
        <div className="flex gap-5 mt-14">
          <Link href='/register' className='btn btn-neutral btn-outline rounded-full px-10' type="button">Register</Link>
          <Link href='/login' className='btn btn-neutral rounded-full px-10' type="button">Login</Link>
        </div>
      </form>
    </div>
  );
}