'use client';
import { useState } from 'react';
import axios from 'axios';
import showToast from '@/components/showToast'
import Link from "next/link"
import { useRouter } from 'next/navigation';

export default function Reset() {
  const router = useRouter()
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
    showToast.error("Email not provided")
    setloading(false)
    return;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailRegex.exec(formData.email)){
    showToast.error("Invalid email")
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
    showToast.success(res.data.message)
  } catch (error) {
    showToast.error(error.response.data.message);
  } finally{
  setloading(false)
  }
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
      router.push('/login');
      setOtpSent(false)
    }
    showToast.success(res.data.message)
  }catch(e){
    showToast.error(e.response.data.message)
  } finally {
    setloading(false)
  }
}

const handleClick = async () => {
  if(otpSent){
    handlePasswordChange()
  }else{
    handleSendOtp()
  }
}


  return (
    <div className='min-h-screen pt-7 w-full flex justify-center'>
      <form className='flex flex-col items-center justify-start md:justify-center w-full max-w-sm gap-y-4 px-4 pb-8'>
      <h1 className='text-center font-bold mb-5 text-2xl'>Reset Password</h1>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Email
            <input type="email" disabled={otpSent} className="grow" placeholder="" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
          </label>
          { otpSent && (
            <>
          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">OTP
            <input type="number" className="grow" placeholder="" 
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required />
          </label>
          
          <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Password
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