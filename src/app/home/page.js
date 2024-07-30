'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from "next/link";
import { redirect } from 'next/navigation';
import checkAuth from '@/utils/checkAuth'

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  checkAuth('in')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user', {
          headers: {
            Authorization: token
          }
        });
        setName(res.data.data.name);
        setEmail(res.data.data.email);
      } catch (e) {
        const authErrors = ['Unauthorised user', 'Invalid token']
        if (authErrors.includes(e.response?.data?.message)) {
          return false
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello {name}</h1>
      <p>Your email is: {email}</p>
      <button className='btn my-8 mx-8' onClick={()=>{
        localStorage.removeItem('token')
        redirect('/login')
      }}>Logout</button>
    </div>
  );
}