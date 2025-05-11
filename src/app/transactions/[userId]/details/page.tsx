"use client";

import React, { useState, ChangeEvent, use } from "react";
import { useRouter } from "next/navigation";
import { mockReservation } from "@/lib/mockReservation";
import { mockUsers } from "@/lib/mockUser";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";
import { mockTransaction } from "@/lib/mockTransaction";
import Link from "next/link";

interface TransactionDetail {
  bookCopyId: string;
  title: string;
  author: string;
  dueDate: string;
}

export default function TransactionDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();

  const user = mockUsers.find((u) => u.cccd === userId);
  const reservedIds: string[] = (mockReservation[userId] as string[]) || [];

  const initialDetails: TransactionDetail[] = reservedIds.map((copyId) => {
    const book = mockBooks.find((b) => b.id === copyId);
    const authorIds: string[] = (book?.authors as string[]) || [];
    const authorNames = authorIds
      .map((aid) => mockAuthors.find((a) => a.id === aid)?.name)
      .filter((name): name is string => Boolean(name));
    const authorStr = authorNames.length > 0 ? authorNames.join(", ") : "Unknown Author";

    return {
      bookCopyId: copyId,
      title: book?.title || "Unknown Title",
      author: authorStr,
      dueDate: new Date().toISOString().slice(0, 10),
    };
  });

  const [details, setDetails] = useState<TransactionDetail[]>(initialDetails);

  const handleChange = (index: number, field: keyof TransactionDetail, value: string) => {
    setDetails((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const handleRemove = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newTransaction = {
      id: `${userId}-${Date.now()}`,
      userId,
      borrowDate: new Date().toISOString().slice(0, 10),
      transactionDetails: details.map((d) => ({
        transactionId: d.bookCopyId,
        bookCopyId: d.bookCopyId,
        returnedDate: null,
        penaltyFee: 0,
      })),
    };
    mockTransaction.push(newTransaction);
    router.push("/transactions");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Chi tiết đặt sách của: {user?.name || userId}
      </h1>

      <div className="overflow-x-auto bg-gray-900 rounded mb-6">
        <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3">Copy ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d, index) => (
              <tr key={d.bookCopyId} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-500">{d.bookCopyId}</td>
                <td className="px-4 py-3 text-gray-500">{d.title}</td>
                <td className="px-4 py-3 text-gray-500">{d.author}</td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={d.dueDate}
                    className="p-1 rounded border border-gray-700 bg-gray-800 text-gray-300"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, "dueDate", e.target.value)
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemove(index)}
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                  >
                    Hủy cuốn
                  </button>
                </td>
              </tr>
            ))}
            {details.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-400">
                  Không có sách để mượn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Quay lại
        </button>
        <Link href="/transactions" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          Hủy
        </Link>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
        >
          Lưu
        </button>
      </div>
    </main>
  );
}
