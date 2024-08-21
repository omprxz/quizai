"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { dropPath, addPath } from "@/reduxStates/authRedirectPathSlice";
import { signOut, useSession } from "next-auth/react";

const AuthSync = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const toRedirect = useSelector((state) => state.authRedirectPath.value);
  const config = JSON.parse(process.env.CONFIG)

  const dynamicPublicUrls = config.dynamicPublicUrls.map((pattern) => new RegExp(pattern));
  const isDynamicPublicUrl = dynamicPublicUrls.some((regex) =>
    regex.test(pathname)
  );

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "authToken") {
        if (isDynamicPublicUrl) {
          location.reload();
        }
        const newToken = localStorage.getItem("authToken");
        if (!newToken) {
          signOut({ redirect: false }).then(() => {
            const params = new URLSearchParams(searchParams);
            params.delete("target");

            const targetUrl = `${pathname}${
              pathname && params.toString()
                ? "?" + params.toString()
                : ""
            }`;

            router.push(`/login${targetUrl ? `?target=${encodeURIComponent(targetUrl)}` : ""}`);
          });
        } else {
          router.push(`/social-auth/sign-in?target=${toRedirect || '/dashboard'}`);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, toRedirect, pathname, searchParams]);

  return null;
};

export default AuthSync;