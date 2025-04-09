"use client"

import { fetchWrapper } from "@/lib/fetchWrapper";
import { Review } from "@/types";

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
    return await fetchWrapper.get(`/reviews/search/findByBookId?bookId=${bookId}`);
}