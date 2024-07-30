import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Eruda from "@/utils/eruda.js"
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuizAI",
  description: "AI Quiz Generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Eruda />
      <Toaster position="bottom-center" />
      {children}
      </body>
    </html>
  );
}
