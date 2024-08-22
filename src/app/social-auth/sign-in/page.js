"use client"
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { dropPath, addPath } from '@/reduxStates/authRedirectPathSlice';
import { resetAtPath } from '@/reduxStates/atPathSlice';

export default function Page(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const toRedirect = useSelector((state) => state.authRedirectPath.value);
  
  const target = searchParams?.get('target') || '';
  
  useEffect(() => {
    target && target !== "" ? dispatch(addPath(target)) : dispatch(dropPath());
  }, [target, session]);
  if(target){
   let finalRedirect = target ? target : toRedirect || '/dashboard';

        const authUrls = [
    /^\/login\/?$/,
    /^\/social-sign-in\/[^\/]+\/?$/,
    /^\/register\/?$/, 
    /^\/password\/reset\/?$/, 
    /^\/?$/
];

        finalRedirect = authUrls.some((regex) => regex.test(finalRedirect)) 
            ? '/dashboard' 
            : finalRedirect;
            router.push(finalRedirect);
            dispatch(resetAtPath());
  }
  
  useEffect(() => {
    if (session) {
      const token = session?.accessToken;
      if(token){
      localStorage.setItem('authToken', token);
      router.push(toRedirect || '/dashboard');
      dispatch(resetAtPath())
      }
    }
  }, [session, toRedirect]);
  
  return (
    <div className='fixed h-full top-0 left-0 w-full z-50'>
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading loading-ring loading-lg"></div>
        <p className="mt-4 text-lg font-medium">Signing you in, please wait...</p>
      </div>
    </div>
    </div>
    )
}