"use client";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import { useDispatch} from 'react-redux';
import { dropPath } from '@/reduxStates/authRedirectPathSlice'

export default function useLogout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  const logOut = () => {
    axios.get('/api/logout')
      .then((res) => {
        localStorage.removeItem('authToken');
        dispatch(dropPath());
        toast.success(res.data.message);
        router.push('/login')
      })
      .catch(() => {
        toast.error("Failed to logout");
      });
  };

  return logOut;
}