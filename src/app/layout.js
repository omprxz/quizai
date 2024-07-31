import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Eruda from "@/utils/eruda"
import { Toaster } from "react-hot-toast";
import Authprovider from "@/components/Authprovider/Authprovider"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuizAI",
  description: "AI Quiz Generator",
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-base-100`}>
      <Eruda />
      <Toaster position="bottom-center" />
      <Authprovider>
      {children}
      </Authprovider>
      </body>
    </html>
  );
}
