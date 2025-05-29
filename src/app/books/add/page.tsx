"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { mockBooks } from "@/lib/mockBook";
import { mockAuthors } from "@/lib/mockAuthors";

export default function AddBookPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    publisher: "",
    publicationDate: "",
    isbn: "",
    status: "Available",
    imageUrl: "",
    authorInput: "",
    categories: "",
    totalCopies: 1,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "totalCopies") {
      if (!/^\d*$/.test(value)) {
        alert("Vui lòng chỉ nhập số nguyên dương.");
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let authorIds: string[] = [];
    const input = formData.authorInput.trim();
    if (input) {
      const existing = mockAuthors.find(
        (a) => a.id === input || a.name.toLowerCase() === input.toLowerCase()
      );
      if (existing) {
        authorIds.push(existing.id);
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
          books: [],
        };
        mockAuthors.push(newAuthor);
        authorIds.push(newId);
      }
    }

    const newBookId = (mockBooks.length + 1).toString();
    const newBook = {
      id: newBookId,
      title: formData.title,
      publisher: formData.publisher,
      publicationDate: formData.publicationDate,
      isbn: formData.isbn,
      status: formData.status,
      rating: 0,
      ratingCount: 0,
      imageUrl:
        formData.imageUrl ||
        "https://via.placeholder.com/200x300?text=No+Image",
      authors: authorIds,
      categories: formData.categories.split(",").map((c) => c.trim()),
      comments: [],
      totalCopies: formData.totalCopies,
    };

    mockBooks.push(newBook);
    router.push("/books");
  };

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Thêm sách mới</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Tiêu đề */}
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 font-medium">
            Tiêu đề
          </label>
          <input
            id="title"
            name="title"
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
            placeholder="Available hoặc Unavailable"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
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
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Tác giả (nhập tên hoặc ID) */}
        <div className="flex flex-col">
          <label htmlFor="authorInput" className="mb-1 font-medium">
            Tác giả (Tên hoặc ID)
          </label>
          <input
            id="authorInput"
            name="authorInput"
            placeholder="Nhập tên hoặc ID tác giả"
            value={formData.authorInput}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* số lượng */}
        <div className="flex flex-col">
          <label htmlFor="totalCopies" className="mb-1 font-medium">
            Số lượng
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
            Categories (comma-separated)
          </label>
          <input
            id="categories"
            name="categories"
            value={formData.categories}
            onChange={handleChange}
            className="w-full p-2 rounded border border-gray-700 bg-gray-800"
          />
        </div>

        {/* Button thêm */}
        <div className="text-center">
          <button
            type="submit"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition-all"
          >
            Thêm sách
          </button>
        </div>
      </form>
    </div>
  );
}
