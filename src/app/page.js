// app/page.js
'use client'
import React from 'react';
import Link from 'next/link'

export default function Home() {
  return (
    <main className="bg-base-200 min-h-screen flex flex-col items-center justify-center">
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">AI Quiz Generator</h1>
            <p className="py-6">
              Generate quizzes effortlessly with the power of AI. Create engaging and challenging quizzes on any topic in minutes!
            </p>
            <Link href='/login' className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Amazing Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">AI-Powered Quiz Creation</h3>
              <p>Let our AI generate quizzes for you based on your chosen topic and difficulty level.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Customizable Quizzes</h3>
              <p>Customize your quizzes with different question types, answer choices, and difficulty levels.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Various Question Types</h3>
              <p>Choose from multiple-choice, true/false, fill-in-the-blank, and more!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}