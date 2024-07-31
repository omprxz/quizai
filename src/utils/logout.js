"use client";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import axios from 'axios';

export default function useLogout() {
  const router = useRouter();

  const logOut = async () => {
    try {
      const res = await axios.get('/api/logout');
      toast.success(res.data.message);
      router.push('/login');
    } catch (e) {
      toast.error("Failed to logout");
    }
  };

  return logOut;
}