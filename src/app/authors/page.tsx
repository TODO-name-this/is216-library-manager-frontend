"use client";

import React, { useState } from "react";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";
import Link from "next/link";

interface ProcessedAuthor {
  id: string;
  name: string;
  image: string;
  books: typeof mockBooks;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    website?: string;
    github?: string;
  };
}

const processAuthors = (): ProcessedAuthor[] => {
  return mockAuthors.map((author) => ({
    ...author,
    image: author.imageUrl, // key "imageUrl" -> "image"
    books: mockBooks.filter((book) => author.books.includes(book.id)),
  }));
};

export default function AuthorListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("nameAsc");

  let authors = processAuthors();

  // Search by name
  if (searchTerm) {
    authors = authors.filter((author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort
  if (sortOption === "nameAsc") {
    authors = authors.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "nameDesc") {
    authors = authors.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortOption === "booksDesc") {
    authors = authors.sort((a, b) => b.books.length - a.books.length);
  } else if (sortOption === "booksAsc") {
    authors = authors.sort((a, b) => a.books.length - b.books.length);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white py-10 px-6">
      <h1 className="text-4xl font-bold text-left mb-8">Our Authors</h1>

      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="🔍 Search authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 p-2 rounded border border-gray-700 bg-gray-800"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 rounded border border-gray-700 bg-gray-800"
        >
          <option value="nameAsc">Sort by Name (A-Z)</option>
          <option value="nameDesc">Sort by Name (Z-A)</option>
          <option value="booksDesc">Sort by Books (Most to Least)</option>
          <option value="booksAsc">Sort by Books (Least to Most)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full items-stretch">
        {authors.map((author) => (
          <Link
            href={`/authors/details/${author.id}`}
            key={author.id}
            className="block"
          >
            <div className="flex flex-col flex-grow bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer h-full">
              <img
                src={author.image}
                alt={author.name}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-semibold text-center h-16 flex items-center justify-center text-ellipsis overflow-hidden">
                {author.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
