import { signIn } from 'next-auth/react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { useSearchParams } from 'next/navigation';

export default function SocialSigninButton({toRedirect}){
  const searchParams = useSearchParams();

  const handleSignIn = (provider) => {
    signIn(provider, {
      callbackUrl: `/login?target=${toRedirect}`,
    });
  };

  return(
    <div className='flex flex-row gap-x-3 flex-wrap'>
        <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
          <button type="button" onClick={() => handleSignIn('google')}>
            <FcGoogle className='text-xl' />
          </button>
        </div>
        <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
          <button type="button" onClick={() => handleSignIn('github')}>
            <FaGithub className='text-base-1000 text-xl' />
          </button>
        </div>
        <div className="flex flex-row flex-nowrap gap-3 border-2 border-neutral rounded-full p-3 justify-center items-center">
          <button type="button" onClick={() => handleSignIn('twitter')}>
            <FaXTwitter className='text-base-1000 text-xl' />
          </button>
        </div>
    </div>
  )
}