"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockReservation } from "@/lib/mockReservation";
import { mockUsers } from "@/lib/mockUser";

interface ReservationSummary {
  id: string; // user CCCD
  memberName: string;
  bookCopyIds: string[]; // danh sách bản sách đã đặt
}

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // user đã đặt trước
  const allSummaries: ReservationSummary[] = mockUsers
    .filter((user) => mockReservation[user.cccd]?.length > 0)
    .map((user) => ({
      id: user.cccd,
      memberName: user.name,
      bookCopyIds: mockReservation[user.cccd],
    }));

  const results = allSummaries.filter(
    (r) =>
      r.id.includes(searchTerm) ||
      r.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {/* Search only */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by CCCD or Name..."
          className="w-64 p-2 rounded border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table of users */}
      <div className="overflow-x-auto bg-gray-900 rounded">
        <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3">CCCD</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t border-gray-700">
                <td className="px-4 py-3 text-gray-500">{r.id}</td>
                <td className="px-4 py-3 text-gray-500">{r.memberName}</td>
                <td className="px-4 py-3 text-gray-500">
                  {r.bookCopyIds.length}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/transactions/${r.id}/details`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
