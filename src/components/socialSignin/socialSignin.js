import { signIn } from 'next-auth/react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaXTwitter } from "react-icons/fa6";


export default function SocialSigninButton(){
  return(
    <>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full px-6 py-2 justify-center items-center">
      <FcGoogle />
      <button type="button" onClick={() => signIn('google')}>Continue with Google</button>
    </div>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full px-6 py-2 justify-center items-center">
      <FaGithub className='text-black' />
      <button type="button" onClick={() => signIn('github')}>Continue with Github</button>
    </div>
    <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full px-6 py-2 justify-center items-center">
      <FaXTwitter className='text-black' />
      <button type="button" onClick={() => signIn('twitter')}>Continue with Twitter</button>
    </div>
    </>
    )
}