import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Eruda from "@/utils/eruda";
import { Toaster } from "react-hot-toast";
import Authprovider from "@/components/Authprovider/Authprovider";
import ReduxProvider from "@/components/ReduxProvider/Provider";
import Header from "@/components/Header";
import ScrollToTop from '@/components/ScrollToTop';
import ProgressBarProvider from '@/components/ProgressBarProvider.jsx';
import { Analytics } from "@vercel/analytics/react";
import AuthSync from "@/components/AuthSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuizAI",
  description: "AI Quiz Generator",
  keywords: "AI Quiz Generator, Quiz Maker, Education, AI, AI Exam Creator",
  author: "Omprakash Kumar",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
      <ReduxProvider>
        {/*<Eruda />*/}
        <ScrollToTop />
        <Analytics />
        <Toaster position="top-center" />
        <AuthSync />
        <Authprovider>
          <ProgressBarProvider>
            {children}
          </ProgressBarProvider>
        </Authprovider>
        </ReduxProvider>
      </body>
    </html>
  );
}