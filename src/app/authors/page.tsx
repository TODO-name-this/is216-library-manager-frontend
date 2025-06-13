"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Author } from "@/types"
import { getAllAuthors } from "@/app/actions/authorActions"
import { usePageTitle } from "@/lib/usePageTitle"

export default function AuthorListPage() {
    usePageTitle("Authors - Scam Library");
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOption, setSortOption] = useState("nameAsc")

    useEffect(() => {
        loadAuthors()
    }, [])

    const loadAuthors = async () => {
        setLoading(true)
        try {
            const authorsData = await getAllAuthors()
            setAuthors(authorsData)
        } catch (error) {
            console.error("Failed to load authors:", error)
        } finally {
            setLoading(false)
        }
    }

    // Process authors for display
    let processedAuthors = [...authors]

    // Search by name
    if (searchTerm) {
        processedAuthors = processedAuthors.filter((author) =>
            author.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    // Sort
    if (sortOption === "nameAsc") {
        processedAuthors = processedAuthors.sort((a, b) =>
            a.name.localeCompare(b.name)
        )
    } else if (sortOption === "nameDesc") {
        processedAuthors = processedAuthors.sort((a, b) =>
            b.name.localeCompare(a.name)
        )
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900 text-white py-10 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-xl">Loading authors...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white py-10 px-6">
            <h1 className="text-4xl font-bold text-left mb-8">Our Authors</h1>

            <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
                <input
                    type="text"
                    placeholder="🔍 Search authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 p-2 rounded border border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
                >
                    <option value="nameAsc">Sort by Name (A-Z)</option>
                    <option value="nameDesc">Sort by Name (Z-A)</option>
                </select>
            </div>

            <p className="mb-6 text-gray-400">
                Showing {processedAuthors.length} of {authors.length} authors
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full items-stretch">
                {processedAuthors.map((author) => (
                    <Link
                        href={`/authors/details/${author.id}`}
                        key={author.id}
                        className="block"
                    >
                        <div className="flex flex-col flex-grow bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer h-full border-2 border-gray-700 hover:border-blue-500">
                            {/* Author Avatar */}
                            <div className="w-full h-60 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {author.avatarUrl ? (
                                    <img
                                        src={author.avatarUrl}
                                        alt={author.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Author Name */}
                            <h2 className="text-xl font-semibold text-center text-white mb-3 line-clamp-2">
                                {author.name}
                            </h2>

                            {/* Author Biography */}
                            {author.biography && (
                                <p className="text-sm text-gray-400 text-center line-clamp-3 flex-grow">
                                    {author.biography}
                                </p>
                            )}

                            {/* Birthday */}
                            {author.birthday && (
                                <div className="mt-3 text-xs text-gray-500 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span>
                                            {new Date(
                                                author.birthday
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* View Details Button */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="text-blue-400 text-sm font-medium text-center hover:text-blue-300 transition-colors">
                                    View Details →
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {processedAuthors.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-4">
                        No authors found
                    </div>
                    {searchTerm && (
                        <p className="text-gray-500">
                            Try adjusting your search terms
                        </p>
                    )}
                </div>
            )}
        </main>
    )
}
