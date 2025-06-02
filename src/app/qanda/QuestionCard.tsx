"use client"

import { useState } from "react"
import { Question } from "@/lib/api/types"
import { useTheme } from "@/lib/ThemeContext"

interface QuestionCardProps {
    question: Question
    expanded: boolean
    onToggle: () => void
    onAnswerSubmit: (id: string, answer: string) => void
}

export default function QuestionCard({
    question: q,
    expanded,
    onToggle,
    onAnswerSubmit,
}: QuestionCardProps) {
    const [answerText, setAnswerText] = useState("")
    const { theme } = useTheme()

    const handleSubmitAnswer = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (answerText.trim()) {
            onAnswerSubmit(q.id, answerText)
            setAnswerText("")
        }
    }

    // Get date badge styles based on theme
    const getDateBadgeClasses = () => {
        const baseClasses = "text-xs px-2 py-1 rounded"
        if (theme === "light") {
            return `${baseClasses} bg-indigo-100 text-indigo-700 font-semibold`
        }
        return `${baseClasses} bg-blue-900 text-blue-300`
    }

    return (
        <div
            className={`group bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-all light-mode:bg-white light-mode:border-gray-300 ${
                expanded ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={onToggle}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-blue-400 light-mode:text-blue-600">
                    {q.question}
                </h3>
                <span className={getDateBadgeClasses()}>{q.askedDate}</span>
            </div>

            <p className="text-sm text-gray-400 light-mode:text-gray-600 mt-1">
                Asked by: {q.askedBy}
            </p>

            {q.answer ? (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg light-mode:bg-gray-100">
                    <div className="flex justify-between items-start">
                        <p className="text-white light-mode:text-gray-900">
                            {q.answer}
                        </p>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-400 light-mode:text-gray-600">
                        <span>Answered by: {q.answeredBy}</span>
                        <span>{q.answeredDate}</span>
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    <p className="text-yellow-500 text-sm light-mode:text-yellow-600">
                        No answer yet
                    </p>

                    {/* Answer Form for Admin (would be conditionally shown based on role) */}
                    {expanded && (
                        <div className="mt-3 border-t border-gray-700 pt-3 light-mode:border-gray-300">
                            <h4 className="font-medium text-sm mb-2 light-mode:text-gray-900">
                                Provide an Answer (Admin only)
                            </h4>
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm mb-2 light-mode:bg-gray-100 light-mode:border-gray-300 light-mode:text-gray-900"
                                rows={3}
                                placeholder="Type your answer here..."
                                onClick={(e) => e.stopPropagation()}
                            ></textarea>
                            <div className="text-right">
                                <button
                                    onClick={handleSubmitAnswer}
                                    className="bg-blue-500 px-3 py-1 rounded text-white text-sm hover:bg-blue-600 transition-colors ensure-white-text"
                                >
                                    Submit Answer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400 light-mode:text-blue-600">
                {!q.answer && "Click to expand"}
            </div>
        </div>
    )
}
