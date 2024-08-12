import { signIn } from 'next-auth/react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaXTwitter } from "react-icons/fa6";


export default function SocialSigninButton(){
  return(
    <>
    <div className='flex flex-row gap-x-3 flex-wrap'>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
      <button type="button" onClick={() => signIn('google')}>
      <FcGoogle className='text-xl' />
      </button>
    </div>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
      <button type="button" onClick={() => signIn('github')}>
      <FaGithub className='text-black dark:text-white text-xl' />
      </button>
    </div>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
      <button type="button" onClick={() => signIn('twitter')}>
      <FaXTwitter className='text-black dark:text-white text-xl' />
      </button>
    </div>
    </div>
    </>
    )
}