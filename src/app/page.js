'use client'
import React from 'react';
import { FaBook, FaUserAlt, FaRegQuestionCircle } from 'react-icons/fa';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900">
      <header className="backdrop-blur-lg bg-black/30 shadow-lg fixed w-full z-50">
        <div className="container mx-auto p-5 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">QuizAI</div>
          <nav className="space-x-5 text-gray-400">
            <Link href="#features" className="hover:text-white">Features</Link>
            <Link href="#about" className="hover:text-white">About</Link>
            <Link href="#contact" className="hover:text-white">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat px-3"
        style={{ backgroundImage: 'url(https://source.unsplash.com/random/1600x900?education)' }}>
        <div className="text-center p-5 backdrop-blur-md bg-black/50 rounded-lg">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-5">Welcome to QuizAI</h1>
          <p className="text-lg text-gray-300 mb-10">Your Ultimate Platform for Creating and Participating in Quizzes</p>
          <p className="text text-gray-300 mb-10">Generate, Learn, Ace</p>
          <Link href="/login" className="btn btn-primary shadow-lg transform transition hover:scale-105">Get Started</Link>
        </div>
      </section>

      <section id="features" className="py-20 px-3">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-10">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-gray-400">
            <div className="p-10 bg-black rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <FaBook className="text-6xl text-white mb-5 mx-auto" />
              <h3 className="text-2xl font-bold mb-3">Create Quizzes</h3>
              <p>Create custom quizzes with multiple question types and manage them effortlessly.</p>
            </div>
            <div className="p-10 bg-black rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <FaUserAlt className="text-6xl text-white mb-5 mx-auto" />
              <h3 className="text-2xl font-bold mb-3">User Management</h3>
              <p>Manage user accounts, track progress, and view quiz participation statistics.</p>
            </div>
            <div className="p-10 bg-black rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <FaRegQuestionCircle className="text-6xl text-white mb-5 mx-auto" />
              <h3 className="text-2xl font-bold mb-3">Responsive Design</h3>
              <p>Enjoy a seamless experience on both mobile and desktop devices.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-blue-900 py-20 px-3">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-10">About QuizAI</h2>
          <p className="max-w-3xl mx-auto text-lg text-white">
            QuizAI is a modern platform designed to make quiz creation and participation easier and more enjoyable.
            With a user-friendly interface and powerful tools, QuizAI is the perfect solution for educators,
            trainers, and quiz enthusiasts.
          </p>
        </div>
      </section>

      <section id="contact" className="py-20 px-3">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-10">Contact Us</h2>
          <p className="max-w-lg mx-auto text-lg mb-5 text-white">Have any questions? Feel free to reach out to us at <a href="mailto:omprxz@gmail.com" className="text-white underline">omprxz@gmail.com</a>.</p>
          <Link href="/login" className="btn btn-primary shadow-lg transform transition hover:scale-105 mt-4">Get Started</Link>
        </div>
      </section>

      <footer className="bg-blue-900 text-white py-5 px-3">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 QuizAI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;