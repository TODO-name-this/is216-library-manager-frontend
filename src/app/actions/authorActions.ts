"use client";

import { fetchWrapper } from "@/lib/fetchWrapper";
import { Root, Author } from "@/types";

export async function getAuthorsByBookId(bookId: string): Promise<Author[]> {
    return await fetchWrapper.get(`/authors/search/findByBookId?bookId=${bookId}`);
}