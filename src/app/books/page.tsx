"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";

export default function BooksPage() {
  // State quản lý chức năng tìm kiếm, lọc và sắp xếp
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("title");

  // Lọc dữ liệu theo từ khóa và trạng thái
  const filteredBooks = mockBooks.filter((book) => {
    const authorNames = (
      Array.isArray(book.authors) ? book.authors : [book.authors]
    )
      .map(
        (authorId) =>
          mockAuthors.find((author) => author.id === authorId)?.name || ""
      )
      .join(" ");
    const searchMatch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      authorNames.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "All" || book.status === filterStatus;
    return searchMatch && statusMatch;
  });

  // Sắp xếp sách theo tiêu chí được chọn
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "date") {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  return (
    <main className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Books List</h1>

      {/* Phần điều khiển: tìm kiếm, lọc và sắp xếp */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="🔍 Search by title or author..."
          className="w-64 p-2 rounded border border-gray-700 bg-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 rounded border border-gray-700 bg-gray-800"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 rounded border border-gray-700 bg-gray-800"
        >
          <option value="title">Sort by Title</option>
          <option value="rating">Sort by Rating</option>
          <option value="date">Sort by Publication Date</option>
        </select>
      </div>

      {/* Hiển thị danh sách sách */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
        {sortedBooks.map((book) => (
          <div
            key={book.id}
            className="group relative flex flex-col h-full rounded-xl border-2 border-gray-800 bg-gray-900 p-5 shadow-2xl transition-all hover:border-blue-500 hover:shadow-blue-500/20 hover:shadow-xl"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Image Container */}
            <div className="relative overflow-hidden rounded-lg w-full h-60">
              <img
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={book.imageUrl}
                alt={book.title}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  // Tạo URL placeholder với text là tiêu đề sách
                  const text = encodeURIComponent(book.title);
                  img.src = `https://via.placeholder.com/200x300?text=${text}`;
                }}
              />
            </div>

            {/* Content */}
            <div className="mt-5 flex flex-col flex-1 justify-between">
              {/* Title with Gradient Text */}
              <h2 className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent line-clamp-2">
                {book.title}
              </h2>

              {/* Metadata with Icons */}
              <div className="mt-3 space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{book.publisher}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{book.publicationDate}</span>
                </div>
              </div>

              {/* Button with Icon */}
              <Link
                href={`/books/details/${book.id}`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-lg"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}