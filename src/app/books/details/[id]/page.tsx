"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockBooks as Book } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";
import { mockReservation } from "@/lib/mockReservation";
import { mockUsers } from "@/lib/mockUser";

const currentUser = mockUsers[0].cccd;

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const book = Book.find((b) => b.id === id);
  if (!book) throw new Error(`Book with id ${id} not found`);

  const [reservedList, setReservedList] = useState<string[]>([]);

  useEffect(() => {
    const reservedBy = Object.entries(mockReservation)
      .filter(([_, books]) => books.includes(book.id))
      .map(([userId]) => userId);
    setReservedList(reservedBy);
  }, [book.id]);

  const hasReserved = mockReservation[currentUser]?.includes(book.id) ?? false;
  const totalCopies = 20;
  const checkedOut = reservedList.length;
  const available = totalCopies - checkedOut;
  const isFull = checkedOut >= totalCopies;

  const handleReserve = () => {
    const userReservations = mockReservation[currentUser] || [];

    if (userReservations.includes(book.id)) return;
    if (userReservations.length >= 5) return;
    if (reservedList.length >= totalCopies) return;

    mockReservation[currentUser] = [...userReservations, book.id];
    setReservedList((prev) => [...prev, currentUser]);
    alert("Reservation successful!");
  };

  const authors = book.authors
    .map((aid) => mockAuthors.find((a) => a.id === aid)?.name)
    .filter(Boolean)
    .join(", ");

  const isUserMaxed = (mockReservation[currentUser]?.length || 0) >= 5;

  return (
    <main className="min-h-screen p-6 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* --- ảnh + info --- */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <img
                className="mx-auto h-auto w-78 rounded shadow-lg"
                src={book.imageUrl}
                alt={book.title}
              />
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-3xl font-bold">{book.title}</h2>
              <p>
                <strong>Author:</strong>{" "}
                <Link href="/authors" className="text-blue-400 hover:underline">
                  {authors}
                </Link>
              </p>
              <p>
                <strong>Publisher:</strong> {book.publisher}
              </p>
              <p>
                <strong>Publication date:</strong> {book.publicationDate}
              </p>
              <p>
                <strong>ISBN:</strong> {book.isbn}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-red-400">{book.status}</span>
              </p>
              <p>
                <strong>Rating:</strong> {book.rating}
                <span className="text-yellow-400">★</span> ({book.ratingCount})
              </p>
            </div>
          </div>

          {/* --- comments --- */}
          <div>
            <h3 className="mt-5 mb-2 text-xl font-bold">
              Comments ({book.comments.length})
            </h3>
            <div className="mt-2 flex items-center space-x-1">
              <span>Rating:</span>
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  title={`${i + 1} star`}
                  className="text-2xl text-gray-400 hover:text-yellow-400"
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              id="comment"
              className="w-full rounded border border-gray-700 bg-gray-900 p-2 mt-2 text-white focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Please comment respectfully…"
            />
            <div className="text-right">
              <button className="mt-1 rounded bg-blue-500 px-4 py-2 hover:bg-blue-600">
                Submit
              </button>
            </div>
            <div className="my-5 space-y-3">
              {book.comments.map((cmt, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-4 bg-gray-800 p-4 rounded shadow"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/149/149071.png"
                    alt={cmt.user}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-blue-300">{cmt.user}</p>
                    <p className="text-sm text-gray-400">
                      {cmt.date} • {cmt.rating}
                      <span className="text-yellow-400">★</span>
                    </p>
                    <p>{cmt.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-5">
              {["«", "‹", "›", "»"].map((char, i) => (
                <button
                  key={i}
                  className="h-12 w-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  {char}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-center">
              <button className="rounded bg-blue-500 px-10 py-2 hover:bg-blue-600">
                Load more comments
              </button>
            </div>
          </div>
        </div>

        {/* --- sidebar availability + reserve button --- */}
        <aside className="space-y-6">
          <div className="p-6 bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-400 mb-2">
              {checkedOut}/5 books checked out
            </p>
            <hr className="border-gray-700" />
            <p className="mt-3 text-lg font-semibold text-blue-400">
              Available
            </p>
            <div className="mt-2 flex justify-between text-sm text-gray-300">
              <span>{totalCopies} copies</span>
              <span>{available} available</span>
            </div>
            <hr className="my-4 border-gray-700" />
            <button
              disabled={hasReserved || isFull || isUserMaxed}
              onClick={handleReserve}
              className={`w-full py-2 rounded-lg font-medium transition ${
                hasReserved || isFull || isUserMaxed
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {hasReserved
                ? "Already Reserved"
                : isFull
                ? `Full (${totalCopies}/${totalCopies})`
                : isUserMaxed
                ? "Limit Reached (5/5)"
                : `Reserve Book (${5 - checkedOut} left)`}
            </button>
            <p className="mt-4 text-sm text-gray-400">
              You have reserved {mockReservation[currentUser]?.length || 0}/5
              books
            </p>
            <p className="mt-2 text-xs text-gray-500">
              This number can change until order is complete.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
