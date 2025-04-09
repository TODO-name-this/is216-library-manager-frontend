"use client"

import { getAuthorsByBookId } from "@/app/actions/authorActions"
import { getBookById } from "@/app/actions/bookActions"
import { getCategoriesByBookId } from "@/app/actions/categoryActions"
import { getReviewsByBookId } from "@/app/actions/reviewActions"

export default async function Details({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id
    const book = await getBookById(id)
    const reviews = await getReviewsByBookId(id)
    const authors = await getAuthorsByBookId(id)
    const categories = await getCategoriesByBookId(id)
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Book Details</h1>

            <div className="shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Book Information</h2>
                <pre className="p-4 rounded overflow-auto">
                    {JSON.stringify(book, null, 2)}
                </pre>
            </div>

            <div className="shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Authors</h2>
                <pre className="p-4 rounded overflow-auto">
                    {JSON.stringify(authors, null, 2)}
                </pre>
            </div>

            <div className="shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Categories</h2>
                <pre className="p-4 rounded overflow-auto">
                    {JSON.stringify(categories, null, 2)}
                </pre>
            </div>

            <div className="shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Reviews</h2>
                <pre className="p-4 rounded overflow-auto">
                    {JSON.stringify(reviews, null, 2)}
                </pre>
            </div>
        </div>
    )
}
