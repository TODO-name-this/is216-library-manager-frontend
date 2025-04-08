"use client"

import { fetchWrapper } from "@/lib/fetchWrapper";
import { Category } from "@/types";

export async function getCategoriesByBookId(bookId: string): Promise<Category[]> {
    return await fetchWrapper.get(`/categories/search/findByBookId?bookId=${bookId}`);
}