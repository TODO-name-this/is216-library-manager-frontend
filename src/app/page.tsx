"use client";

import React from "react";
import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";

export default function HomePage() {
  usePageTitle("Home - Scam Library");

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
        className="animate-bounce bg-blue-500 hover:bg-blue-600 transition-colors text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg mt-8 ensure-white-text"
      >
        Explore Our Collection →
      </Link>

      <div className="fixed bottom-6 right-6 z-10">
        <div className="group relative">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <div className="hidden group-hover:block absolute bottom-full right-0 w-64 bg-gray-800 rounded-lg shadow-xl p-4">
            <h3 className="font-bold text-lg mb-2 text-blue-400">Q&A</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-300 block">
                  How to borrow books?
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 block">
                  Membership options
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300 block">
                  Technical support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
