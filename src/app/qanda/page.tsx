"use client"

import { useState } from "react"

interface Question {
    id: string
    question: string
    askedBy: string
    askedDate: string
    answer?: string
    answeredBy?: string
    answeredDate?: string
}

// Mock data for questions
const mockQuestions: Question[] = [
    {
        id: "1",
        question: "How long can I borrow books?",
        askedBy: "student@example.com",
        askedDate: "2025-03-15",
        answer: "Standard borrowing period is 14 days. You can extend once for another 7 days if no one has reserved the book.",
        answeredBy: "librarian@scamlibrary.com",
        answeredDate: "2025-03-16",
    },
    {
        id: "2",
        question:
            "Do you have any programming books on functional programming?",
        askedBy: "coder@example.com",
        askedDate: "2025-03-20",
        answer: "Yes, we have several books on functional programming including titles on Haskell, Scala, and functional JavaScript. Please check our programming section or search 'functional programming' on our catalog.",
        answeredBy: "librarian@scamlibrary.com",
        answeredDate: "2025-03-21",
    },
    {
        id: "3",
        question:
            "Can I reserve books that are currently borrowed by someone else?",
        askedBy: "reader@example.com",
        askedDate: "2025-04-01",
        answer: "Yes, you can reserve books that are currently checked out. You'll receive an email notification when the book becomes available.",
        answeredBy: "admin@scamlibrary.com",
        answeredDate: "2025-04-02",
    },
    {
        id: "4",
        question: "Are there any late fees for overdue books?",
        askedBy: "curious@example.com",
        askedDate: "2025-04-10",
        // No answer yet
    },
    {
        id: "5",
        question: "How do I donate books to the library?",
        askedBy: "donor@example.com",
        askedDate: "2025-04-15",
        // No answer yet
    },
]

export default function QandAPage() {
    const [activeTab, setActiveTab] = useState<"ask" | "view">("view")
    const [question, setQuestion] = useState("")
    const [email, setEmail] = useState("")
    const [answerText, setAnswerText] = useState<Record<string, string>>({})
    const [expandedCard, setExpandedCard] = useState<string | null>(null)

    const handleSubmitQuestion = (e: React.FormEvent) => {
        e.preventDefault()
        alert(`Question submitted: "${question}" by ${email}`)
        setQuestion("")
        setEmail("")
    }

    const handleSubmitAnswer = (id: string) => {
        if (answerText[id]?.trim()) {
            alert(`Answer submitted for question #${id}: "${answerText[id]}"`)
            setAnswerText((prev) => ({ ...prev, [id]: "" }))
            setExpandedCard(null)
        }
    }

    return (
        <main className="p-4 text-white bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Q&A Forum</h1>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-6">
                <button
                    className={`py-2 px-4 ${
                        activeTab === "view"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("view")}
                >
                    Browse Questions
                </button>
                <button
                    className={`py-2 px-4 ${
                        activeTab === "ask"
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveTab("ask")}
                >
                    Ask a Question
                </button>
            </div>

            {/* Ask Question Form */}
            {activeTab === "ask" && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-colors">
                    <h2 className="text-xl font-semibold mb-4">
                        Ask a New Question
                    </h2>
                    <form onSubmit={handleSubmitQuestion} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1"
                            >
                                Your Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="question"
                                className="block text-sm font-medium mb-1"
                            >
                                Your Question
                            </label>
                            <textarea
                                id="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={4}
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                                required
                            ></textarea>
                        </div>
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-500 px-6 py-2 rounded text-white hover:bg-blue-600 transition-colors ensure-white-text"
                            >
                                Submit Question
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View Questions */}
            {activeTab === "view" && (
                <div className="space-y-6">
                    {mockQuestions.map((q) => (
                        <div
                            key={q.id}
                            className={`group bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-all ${
                                expandedCard === q.id
                                    ? "ring-2 ring-blue-500"
                                    : ""
                            }`}
                            onClick={() =>
                                setExpandedCard(
                                    expandedCard === q.id ? null : q.id
                                )
                            }
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-blue-400">
                                    {q.question}
                                </h3>
                                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                                    {q.askedDate}
                                </span>
                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                                Asked by: {q.askedBy}
                            </p>

                            {q.answer ? (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <p className="text-gray-200">
                                            {q.answer}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                                        <span>Answered by: {q.answeredBy}</span>
                                        <span>{q.answeredDate}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <p className="text-yellow-500 text-sm">
                                        No answer yet
                                    </p>

                                    {/* Answer Form for Admin (would be conditionally shown based on role) */}
                                    {expandedCard === q.id && (
                                        <div className="mt-3 border-t border-gray-700 pt-3">
                                            <h4 className="font-medium text-sm mb-2">
                                                Provide an Answer (Admin only)
                                            </h4>
                                            <textarea
                                                value={answerText[q.id] || ""}
                                                onChange={(e) =>
                                                    setAnswerText((prev) => ({
                                                        ...prev,
                                                        [q.id]: e.target.value,
                                                    }))
                                                }
                                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm mb-2"
                                                rows={3}
                                                placeholder="Type your answer here..."
                                            ></textarea>
                                            <div className="text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleSubmitAnswer(q.id)
                                                    }}
                                                    className="bg-blue-500 px-3 py-1 rounded text-white text-sm hover:bg-blue-600 transition-colors ensure-white-text"
                                                >
                                                    Submit Answer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400">
                                {!q.answer && "Click to expand"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
