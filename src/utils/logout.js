"use client";
import { useRouter } from 'next/navigation';
import showToast from '@/components/showToast';
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { dropPath } from '@/reduxStates/authRedirectPathSlice';
import { resetAtPath } from '@/reduxStates/atPathSlice';
import { useState } from 'react';

export default function useLogout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const logOut = () => {
    setLoggingOut(true);
    axios.get('/api/logout')
      .then((res) => {
        localStorage.removeItem('authToken');
        dispatch(dropPath());
        showToast.success(res.data.message);
        router.push('/login');
        dispatch(resetAtPath());
      })
      .catch((error) => {
        console.error(error);
        showToast.error("Failed to logout");
      })
      .finally(() => {
        setLoggingOut(false);
      });
  };

  return { logOut, loggingOut };
}