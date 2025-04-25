"use client"

import { useState } from "react"

interface QuestionFormProps {
    onSubmit: (email: string, question: string) => void
}

export default function QuestionForm({ onSubmit }: QuestionFormProps) {
    const [question, setQuestion] = useState("")
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (question.trim() && email.trim()) {
            onSubmit(email, question)
            setQuestion("")
            setEmail("")
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-colors light-mode:bg-white light-mode:border-gray-300">
            <h2 className="text-xl font-semibold mb-4 light-mode:text-gray-900">
                Ask a New Question
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1 light-mode:text-gray-700"
                    >
                        Your Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white light-mode:bg-gray-100 light-mode:border-gray-300 light-mode:text-gray-900"
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="question"
                        className="block text-sm font-medium mb-1 light-mode:text-gray-700"
                    >
                        Your Question
                    </label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white light-mode:bg-gray-100 light-mode:border-gray-300 light-mode:text-gray-900"
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
    )
}
