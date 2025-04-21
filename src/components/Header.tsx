"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 border-b border-gray-700 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">📚</span>
          <h1 className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
            Scam Library
          </h1>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className={`px-3 py-1 rounded-md transition-colors ${
              pathname === "/"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/books"
            className={`px-3 py-1 rounded-md transition-colors ${
              pathname.startsWith("/books")
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Books
          </Link>
        </nav>
      </div>
    </header>
  );
}