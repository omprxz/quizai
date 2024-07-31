'use client';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import SocialSigninButton from '@/components/socialSignin/socialSignin'

export default function Page(){
  const router = useRouter()
  
  return(
    <div className='p-4'>
    <h1 className='font-bold text-neutral text-2xl'>Create Quiz</h1>
    </div>
    )
  
}