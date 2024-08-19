"use client"
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { dropPath, addPath } from '@/reduxStates/authRedirectPathSlice';

export default function Page(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const toRedirect = useSelector((state) => state.authRedirectPath.value);
  
  const target = searchParams?.get('target') || '';
  
  useEffect(() => {
    target && target !== "" ? dispatch(addPath(decodeURIComponent(target))) : dispatch(dropPath());
  }, [target, session]);
  
  useEffect(() => {
    if (session) {
      const token = session?.accessToken;
      if(token){
      localStorage.setItem('authToken', token);
      router.push(toRedirect ? toRedirect : '/dashboard');
      
      }
    }
  }, [session, toRedirect]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading loading-ring loading-lg"></div>
        <p className="mt-4 text-lg font-medium">Signing you in, please wait...</p>
      </div>
    </div>
    )
}