"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const authorProfile = mockAuthors.find((author) => author.id === id);

  if (!authorProfile) {
    return (
      <div className="p-4 text-white bg-gray-900 min-h-screen">
        <p>Author not found.</p>
        <Link href="/authors" className="text-blue-500 hover:text-blue-600">
          Back to Authors
        </Link>
      </div>
    );
  }

  const booksWritten = mockBooks.filter((book) =>
    authorProfile.books.includes(book.id)
  );

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        {/* Back button */}
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col sm:flex-row items-center gap-6">
        <img
          src={authorProfile.imageUrl}
          alt={authorProfile.name}
          className="w-64 h-64 rounded-xl object-cover border-2 border-gray-700"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">
            {authorProfile.name}
          </h1>
          <p className="mt-2 text-gray-300">{authorProfile.bio}</p>
          {authorProfile.socialLinks && (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {authorProfile.socialLinks.twitter && (
                <a
                  href={authorProfile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775a4.932 4.932 0 002.163-2.724 9.865 9.865 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.945 13.945 0 011.671 3.149a4.822 4.822 0 001.523 6.573 4.902 4.902 0 01-2.229-.616v.061a4.918 4.918 0 003.946 4.827 4.996 4.996 0 01-2.224.085 4.93 4.93 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.396 0-.788-.023-1.175-.067a13.978 13.978 0 007.557 2.209c9.054 0 14-7.496 14-13.986 0-.21-.005-.423-.014-.632a9.935 9.935 0 002.457-2.548l-.047-.02z" />
                  </svg>
                </a>
              )}
              {authorProfile.socialLinks.website && (
                <a
                  href={authorProfile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 20.25c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0 0v-18"
                    />
                  </svg>
                </a>
              )}
              {authorProfile.socialLinks.github && (
                <a
                  href={authorProfile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.613-4.042-1.613-.546-1.385-1.333-1.754-1.333-1.754-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.305.76-1.605-2.665-.304-5.467-1.334-5.467-5.93 0-1.31.47-2.381 1.235-3.221-.135-.303-.54-1.527.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.65.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221 0 4.61-2.805 5.625-5.475 5.92.435.372.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">
        Books Written By {authorProfile.name}
      </h2>

      {booksWritten.length === 0 ? (
        <p className="text-lg text-gray-300">No books found for this author.</p>
      ) : (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {booksWritten.map((book) => (
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
                    const text = encodeURIComponent(book.title);
                    img.src = `https://via.placeholder.com/200x300?text=${text}`;
                  }}
                />
              </div>

              {/* Book Info */}
              <div className="mt-5 flex flex-col flex-1 justify-between">
                <h3 className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent line-clamp-2">
                  {book.title}
                </h3>
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
        </main>
      )}
    </div>
  );
}
