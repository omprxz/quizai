'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dropPath, addPath } from '@/reduxStates/authRedirectPathSlice';
import axios from 'axios';
import showToast from '@/components/showToast'
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import SocialSigninButton from '@/components/socialSignin/socialSignin';
import { useSession } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const target = searchParams?.get('target') || '';
  const config = JSON.parse(process.env.CONFIG)

  const { data: session } = useSession();

  useEffect(() => {
    target && target !== "" ? dispatch(addPath(target)) : dispatch(dropPath());
  }, [target, session]);

  const toRedirect = useSelector((state) => state.authRedirectPath.value);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setloading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setloading(true);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.exec(formData.email)) {
      showToast.error("Invalid email");
      setloading(false);
      return;
    }
    if (!formData.password) {
      showToast.error("Password can not be empty");
      setloading(false);
      return;
    }
    axios.post('/api/login', JSON.stringify(formData), {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => {
      if (res.data.success) {
        setFormData({
          email: '',
          password: '',
        });
        localStorage.setItem('authToken', res?.data?.token);
          let finalRedirect = target ? target : toRedirect || '/dashboard';

  const authUrls = config.authUrls.map((pattern) => new RegExp(pattern));

        finalRedirect = authUrls.some((regex) => regex.test(finalRedirect)) 
            ? '/dashboard' 
            : finalRedirect;
        router.push('social-auth/sign-in?target='+finalRedirect);
      }
      showToast.success(res.data.message);
    }).catch(error => {
      console.log(error);
      showToast.error(error?.response?.data?.message || error?.message || error || 'Unable to login.');
    }).finally(() => {
      setloading(false);
    });
  };

  return (
    <div className='min-h-screen pt-7 w-full flex justify-center'>
      <form className='flex flex-col items-center w-full max-w-sm justify-start md:justify-center gap-y-4 px-4 pb-8' onSubmit={handleSubmit}>
        <h1 className='text-center font-bold mb-5 text-2xl'>Log into QuizAI</h1>
        <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Email
          <input type="email" className="grow" placeholder=""
            name="email"
            value={formData.email}
            onChange={handleChange}
            required />
        </label>
        
        <label className="input input-bordered flex items-center gap-2 min-w-full w-full max-w-sm">Password
          <input type="password" className="grow" placeholder=""
            name="password"
            value={formData.password}
            onChange={handleChange}
            required />
        </label>
      
        <button className='btn btn-neutral rounded-full px-8 mt-4' disabled={loading} type="submit">{
          loading ? 'Please wait' : 'Login'
        }</button>
        <p className='text-center'>or</p>
        <SocialSigninButton toRedirect={toRedirect} />
        <p className='text-center mt-6 text-blue-600'><Link href="/password/reset">Forgot password?</Link></p>
        <Link href='/register' className='btn btn-neutral btn-outline rounded-full mt-6 px-12' type="button">Register</Link>
      </form>
    </div>
  );
}