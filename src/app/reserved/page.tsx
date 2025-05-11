"use client";

import React, { useState, useEffect } from "react";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";
import { mockReservation } from "@/lib/mockReservation";
import { mockUsers } from "@/lib/mockUser";

const currentUser = mockUsers[0].cccd;

interface ReservedItem {
  id: string;
  dueDate: string;
}

export default function ReservedBooks() {
  const [reservedItems, setReservedItems] = useState<ReservedItem[]>([]);

  useEffect(() => {
    const userReservations: string[] = mockReservation[currentUser] || [];
    const now = new Date();
    const items: ReservedItem[] = userReservations.map((id) => {
      const due = new Date();
      due.setDate(now.getDate() + 3);
      return { id, dueDate: due.toISOString().slice(0, 10) };
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    const validItems = items.filter((item) => item.dueDate >= todayStr);
    const validIds = validItems.map((item) => item.id);

    if (validIds.length > 0) {
      mockReservation[currentUser] = validIds;
    } else {
      delete mockReservation[currentUser];
    }

    setReservedItems(validItems);
  }, []);

  const handleRemove = (bookId: string) => {
    const updatedItems = reservedItems.filter((item) => item.id !== bookId);
    const updatedIds = updatedItems.map((item) => item.id);

    if (updatedIds.length > 0) {
      mockReservation[currentUser] = updatedIds;
    } else {
      delete mockReservation[currentUser];
    }

    setReservedItems(updatedItems);
  };

  if (reservedItems.length === 0) {
    return <p className="text-gray-400">No reserved books.</p>;
  }

  return (
    <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
      <thead className="bg-gray-700">
        <tr>
          <th className="px-4 py-3">STT</th>
          <th className="px-4 py-3">Ảnh</th>
          <th className="px-4 py-3">Tiêu đề</th>
          <th className="px-4 py-3">Tác giả</th>
          <th className="px-4 py-3">Hạn chót</th>
          <th className="px-4 py-3">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {reservedItems.map((item, idx) => {
          const book = mockBooks.find((b) => b.id === item.id);
          const authors = book?.authors
            .map((aid) => mockAuthors.find((a) => a.id === aid)?.name)
            .filter(Boolean)
            .join(", ");
          return (
            <tr key={item.id} className="border-t border-gray-700">
              <td className="px-4 py-3 w-12">{idx + 1}</td>
              <td className="px-4 py-3 w-16">
                {book?.imageUrl && (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-blue-300 font-medium">
                {book?.title}
              </td>
              <td className="px-4 py-3 text-gray-400">{authors}</td>
              <td className="px-4 py-3 text-gray-200">{item.dueDate}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Xóa
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
