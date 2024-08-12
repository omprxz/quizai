import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Eruda from "@/utils/eruda";
import { Toaster } from "react-hot-toast";
import Authprovider from "@/components/Authprovider/Authprovider";
import Header from "@/components/Header";
import ScrollToTop from '@/components/ScrollToTop';
import ProgressBarProvider from '@/components/ProgressBarProvider.jsx';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuizAI",
  description: "AI Quiz Generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {/*<Eruda />*/}
        <ScrollToTop />
        <Toaster position="top-center" />
        <Authprovider>
        <ProgressBarProvider>
          {children}
        </ProgressBarProvider>
        </Authprovider>
      </body>
    </html>
  );
}