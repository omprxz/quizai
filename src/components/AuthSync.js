"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { dropPath, addPath } from "@/reduxStates/authRedirectPathSlice";
import { resetAtPath } from '@/reduxStates/atPathSlice';
import { signOut, useSession } from "next-auth/react";

const AuthSync = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const toRedirect = useSelector((state) => state.authRedirectPath.value);
  const config = JSON.parse(process.env.CONFIG)

  const dynamicPublicUrls = config.dynamicPublicUrls.map((pattern) => new RegExp(pattern));
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) =>
    regex.test(pathname)
  );
  
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "authToken") {
        if (isDynamicPublicUrl) {
          location.reload();
        }
        const newToken = localStorage.getItem("authToken");
        dispatch(resetAtPath());
        if (!newToken) {
          setLoggingOut(true)
          signOut({ redirect: false }).then(() => {
            const params = new URLSearchParams(searchParams);
            params.delete("target");

            const targetUrl = `${pathname}${
              params.toString()
                ? "%3F" + encodeURIComponent(params.toString())
                : ""
            }`;

            router.push(`/login${targetUrl ? `?target=${encodeURIComponent(targetUrl)}` : ""}`);
            dispatch(resetAtPath())
          }).finally(()=>setLoggingOut(false));
        } else {
          router.push(`/social-auth/sign-in?target=${toRedirect || '/dashboard'}`);
          dispatch(resetAtPath())
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, toRedirect, pathname, searchParams]);

  return (
    <>
    {loggingOut && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="text-center">
            <div className="loading loading-ring loading-lg"></div>
            <p className="mt-4 text-lg font-medium text-white">Signing you out, please wait...</p>
          </div>
        </div>
      )}
    </>
    );
};

export default AuthSync;