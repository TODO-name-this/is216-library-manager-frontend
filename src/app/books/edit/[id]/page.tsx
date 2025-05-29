"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";

export default function EditBookPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const bookIndex = mockBooks.findIndex((b) => b.id === id);
  if (bookIndex === -1) throw new Error(`Book with id ${id} not found`);

  const existing = mockBooks[bookIndex];
  const [formData, setFormData] = useState({
    title: existing.title,
    publisher: existing.publisher,
    publicationDate: existing.publicationDate,
    isbn: existing.isbn,
    status: existing.status,
    imageUrl: existing.imageUrl,
    authorInput:
      existing.authors.map(
        (aid) => mockAuthors.find((x) => x.id === aid)?.id
      )[0] || "",
    categories: existing.categories.join(","),
    totalCopies: existing.totalCopies.toString(),
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "totalCopies") {
      // Chỉ cho phép chuỗi số nguyên dương
      if (!/^\d*$/.test(value)) {
        alert("Vui lòng chỉ nhập số nguyên dương.");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to apply these changes?")) return;

    // validate totalCopies
    let qty = parseInt(formData.totalCopies, 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    // Process authorInput
    let authorIds: string[] = [];
    const input = formData.authorInput.trim();
    if (input) {
      const found = mockAuthors.find(
        (a) => a.id === input || a.name.toLowerCase() === input.toLowerCase()
      );
      if (found) {
        authorIds.push(found.id);
      } else {
        const newId = `A_${mockAuthors.length + 1}`;
        const newAuthor = {
          id: newId,
          name: input,
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            input
          )}&background=000&color=fff`,
          bio: "",
          birthDate: "",
          books: [] as string[],
        };
        mockAuthors.push(newAuthor);
        authorIds.push(newId);
      }
    }

    // Update book
    mockBooks[bookIndex] = {
      ...existing,
      title: formData.title,
      publisher: formData.publisher,
      publicationDate: formData.publicationDate,
      isbn: formData.isbn,
      status: formData.status,
      imageUrl: formData.imageUrl || existing.imageUrl,
      authors: authorIds,
      categories: formData.categories.split(",").map((c) => c.trim()),
      totalCopies: qty,
    };

    alert("Book updated successfully.");
    router.push(`/books/details/${id}`);
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Chỉnh sửa sách</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Tiêu đề */}
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 font-medium">
            Tiêu đề
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
            required
          />
        </div>

        {/* Nhà xuất bản */}
        <div className="flex flex-col">
          <label htmlFor="publisher" className="mb-1 font-medium">
            Nhà xuất bản
          </label>
          <input
            id="publisher"
            name="publisher"
            type="text"
            value={formData.publisher}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
            required
          />
        </div>

        {/* Ngày xuất bản */}
        <div className="flex flex-col">
          <label htmlFor="publicationDate" className="mb-1 font-medium">
            Ngày xuất bản
          </label>
          <input
            id="publicationDate"
            name="publicationDate"
            type="date"
            value={formData.publicationDate}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
            required
          />
        </div>

        {/* ISBN */}
        <div className="flex flex-col">
          <label htmlFor="isbn" className="mb-1 font-medium">
            ISBN
          </label>
          <input
            id="isbn"
            name="isbn"
            type="text"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Trạng thái */}
        <div className="flex flex-col">
          <label htmlFor="status" className="mb-1 font-medium">
            Trạng thái
          </label>
          <input
            id="status"
            name="status"
            type="text"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
            required
          />
        </div>

        {/* URL ảnh */}
        <div className="flex flex-col">
          <label htmlFor="imageUrl" className="mb-1 font-medium">
            URL ảnh
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Tác giả */}
        <div className="flex flex-col">
          <label htmlFor="authorInput" className="mb-1 font-medium">
            Tác giả (Tên hoặc ID)
          </label>
          <input
            id="authorInput"
            name="authorInput"
            type="text"
            value={formData.authorInput}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Số lượng bản sao */}
        <div className="flex flex-col">
          <label htmlFor="totalCopies" className="mb-1 font-medium">
            Số lượng bản sao
          </label>
          <input
            id="totalCopies"
            name="totalCopies"
            type="text"
            value={formData.totalCopies}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
            required
          />
        </div>

        {/* Categories */}
        <div className="flex flex-col">
          <label htmlFor="categories" className="mb-1 font-medium">
            Categories
          </label>
          <input
            id="categories"
            name="categories"
            type="text"
            value={formData.categories}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition-all"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
