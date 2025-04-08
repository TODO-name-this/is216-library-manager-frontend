"use client"

import { fetchWrapper } from "@/lib/fetchWrapper";
import { Book, Root } from "@/types";

export async function getBooks(): Promise<Root<Book>> {
    return await fetchWrapper.get("/books");
}

export async function getBookById(id: string): Promise<Book> {
    return await fetchWrapper.get(`/books/${id}`);
}