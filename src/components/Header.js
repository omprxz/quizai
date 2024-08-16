"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import useLogout from "@/utils/logout";

const Header = () => {
  const router = useRouter();
  const logOut = useLogout();
  const [ppOpen, setPpOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [userImage, setUserImage] = useState('/user.png');
  const imgRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    axios.get('/api/user')
      .then((res) => {
        setUserData(res?.data);
        setUserImage(res?.data?.data?.image || '/user.png')
      })
      .catch((e) => console.log(e.response.data));
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

  return (
    <>
      {ppOpen && (
        <div ref={menuRef} className="fixed top-12 right-8 p-3 z-20">
          <div className="rounded p-3 flex flex-col justify-start gap-2 text-sm bg-neutral text-white glass shadow-sm shadow-neutral">
            <Link href='/dashboard/settings'>Settings</Link>
            <hr />
            <button onClick={logOut}>Logout</button>
          </div>
        </div>
      )}
      <header className="fixed top-0 w-full bg-base-100 z-10 print:hidden">
        <div className="navbar flex justify-between items-center px-4 h-16">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="btn btn-ghost btn-circle">
              <FaArrowLeft className="text-xl" />
            </button>
          </div>
          <div className="flex items-center">
            <Link href="/dashboard" className="btn btn-ghost btn-circle">
              <FaHome className="text-xl" />
            </Link>
          </div>
          <div className="flex items-center">
            <button onClick={() => setPpOpen((prev) => !prev)} className="btn btn-ghost btn-circle">
              <img
                ref={imgRef}
                src={userImage || '/user.png'}
                width="30"
                height="30"
                className='dark:shadow-gray-400 shadow-gray-800 shadow rounded-full aspect-square'
              />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;