"use client"
import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDispatch, useSelector} from 'react-redux';
import { dropPath, addPath } from '@/reduxStates/authRedirectPathSlice'
import { signOut, useSession } from 'next-auth/react';

const AuthSync = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const toRedirect = useSelector((state) => state.authRedirectPath.value)
  
  const dynamicPublicUrls = [
    /^\/dashboard\/quiz\/[^\/]+\/view$/, 
    /^\/dashboard\/quiz\/response\/[^\/]+/
  ];
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) => regex.test(pathname));

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authToken'){
        const newToken = localStorage.getItem('authToken');
        if(isDynamicPublicUrl){
          location.reload()
        }
        if (!newToken) {
          signOut({redirect: false}).then(()=>{
          router.push(`/login${pathname && '?target='+ encodeURIComponent(pathname, searchParams)}`);
          })
        } else {
          router.push(toRedirect || '/dashboard');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, toRedirect, pathname, searchParams]);

  return null;
};

export default AuthSync;