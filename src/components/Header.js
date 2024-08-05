"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHome, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import useLogout from "@/utils/logout";

const Header = () => {
  const router = useRouter();
  const logOut = useLogout();
  return (
    <header className="navbar bg-base-100 flex justify-between items-center px-4">
      <div className="flex items-center">
        <button onClick={() => router.back()} className="btn btn-ghost btn-circle">
          <FaArrowLeft className="text-xl" />
        </button>
      </div>
      <div className="flex items-center">
        <Link href="/" className="btn btn-ghost btn-circle">
          <FaHome className="text-xl" />
        </Link>
      </div>
      <div className="flex items-center">
        <button onClick={logOut} className="btn btn-ghost btn-circle">
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </header>
  );
};

export default Header;