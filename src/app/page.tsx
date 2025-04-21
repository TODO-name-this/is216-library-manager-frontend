"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8 mb-8">
        {/* Text Content with Animation */}
        <div className="flex-1 space-y-4 animate-fadeInLeft">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to Scam Library 
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Discover a world of knowledge in our digital library. Whether you're
            looking for inspiration, learning, or pure enjoyment, we have books
            to suit every taste.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <p className="text-gray-300">5000+ Digital Books</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
              <p className="text-gray-300">24/7 Unlimited Access</p>
            </div>
          </div>
        </div>

        <div className="flex-1 animate-fadeInRight">
          <div className="relative w-full h-96 rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1470&q=80"
              alt="Book Collection"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <Link
        href="/books"
        className="animate-bounce bg-blue-500 hover:bg-blue-600 transition-colors text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg mt-8"
      >
        Explore Our Collection →
      </Link>
    </main>
  );
}
