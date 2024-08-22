"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { FaRegCircleQuestion } from "react-icons/fa6";
import useLogout from "@/utils/logout";
import { signIn, useSession } from 'next-auth/react';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const config = JSON.parse(process.env.CONFIG);
  const authUrls = config.authUrls.map((pattern) => new RegExp(pattern));
  const isAuthUrl = authUrls.some((regex) => regex.test(pathname));
  const { logOut, loggingOut } = useLogout();
  const [ppOpen, setPpOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [userImage, setUserImage] = useState('/user.png');
  const [token, setToken] = useState(null);
  const imgRef = useRef(null);
  const menuRef = useRef(null);
  const [atPath, setAtPath] = useState(0);
  const initialRender = useRef(true);
  const ISSERVER = typeof window === "undefined";
  const [theme, setTheme] = useState(() => {
    if (!ISSERVER) {
        return localStorage.getItem('theme') || 'light';
    }
    return 'light';
});
const [feedbackPublic, setFeedbackPublic] = useState(false)
  
  useEffect(() => {
    setToken(localStorage?.getItem('authToken'));
  }, [router, pathname]);
  
  useEffect(() => {
    setPpOpen(false);
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      setAtPath(p => p + 1);
    }
  }, [pathname]);

  useEffect(() => {
    axios.get('/api/user')
      .then((res) => {
        setUserData(res?.data);
        setUserImage(res?.data?.data?.image || '/user.png');
      })
      .catch((e) => console.error(e.response.data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        imgRef.current && !imgRef.current.contains(event.target)
      ) {
        setPpOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (loggingOut) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loggingOut]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme)
    const localTheme = localStorage.getItem('theme')
    document.querySelector('html').setAttribute('data-theme', localTheme)
  }, [theme])
  
  const handleBack = () => {
    router.back();
    if(atPath > 1){
      setAtPath(p => p - 2);
    }
  };
  
  const handleThemeChange = (e) => {
    if(e.target.checked){
      setTheme("dark")
    }else{
      setTheme("light")
    }
  }
  if(pathname == '/'){
    return null;
  }

  return (
    <div className='mb-16'>
      {ppOpen && token && (
        <div ref={menuRef} className="fixed top-12 right-8 p-3 z-20">
          <div className="rounded p-3 flex flex-col justify-start gap-2 text-sm bg-neutral text-white glass shadow-sm shadow-neutral">
            <Link href='/dashboard/settings'>Settings</Link>
            <hr />
            <button onClick={logOut}>Logout</button>
          </div>
        </div>
      )}
      
      {loggingOut && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-30">
          <div className="text-center">
            <div className="loading loading-ring loading-lg"></div>
            <p className="mt-4 text-lg font-medium text-white">Signing you out, please wait...</p>
          </div>
        </div>
      )}

      <header className="fixed top-0 w-full bg-base-100 z-10 print:hidden">
        <div className="navbar flex justify-between items-center px-4 h-16">
          {atPath > 1 && (
            <div className="flex items-center">
              <button onClick={handleBack} className="btn btn-ghost btn-circle">
                <FaArrowLeft className="text-xl" />
              </button>
            </div>
          )}
          {
            <label className="swap swap-rotate">
  <input type="checkbox" checked={theme=== 'dark'} onChange={handleThemeChange} />

  <svg
    className="swap-on h-6 w-6 fill-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24">
    <path
      d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>

  <svg
    className="swap-off h-6 w-6 fill-current"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24">
    <path
      d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
  </svg>
</label>
          }
          <div className="flex items-center">
            <Link href={isAuthUrl ? '/' : '/dashboard'} className="btn btn-ghost btn-circle">
              <FaHome className="text-xl" />
            </Link>
          </div>
          {
            feedbackPublic &&
            <FaRegCircleQuestion className='text-xl' />
          }
          { token &&
          <div className="flex items-center">
            <button onClick={() => {
              setPpOpen((prev) => !prev)
            }} className="btn btn-ghost btn-circle">
              <Image
                ref={imgRef}
                src={userImage || '/user.png'}
                width="30"
                height="30"
                alt="User pic"
                className='dark:shadow-gray-400 shadow-gray-800 shadow rounded-full aspect-square'
              />
            </button>
          </div>
          }
        </div>
      </header>
    </div>
  );
};

export default Header;