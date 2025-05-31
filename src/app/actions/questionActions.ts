"use client"

import { questionAPI } from "@/lib/api"
import type {
    Question,
    CreateQuestionRequest,
    UpdateQuestionRequest,
} from "@/lib/api/types"

export async function getAllQuestions(): Promise<Question[]> {
    try {
        const response = await questionAPI.getQuestions()
        return response.data || []
    } catch (error) {
        console.error("Error fetching questions:", error)
        throw error
    }
}

export async function getQuestionById(id: number): Promise<Question | null> {
    try {
        const response = await questionAPI.getQuestionById(id)
        return response.data || null
    } catch (error) {
        console.error("Error fetching question:", error)
        throw error
    }
}

export async function createQuestion(
    questionData: CreateQuestionRequest
): Promise<Question | null> {
    try {
        const response = await questionAPI.createQuestion(questionData)
        return response.data || null
    } catch (error) {
        console.error("Error creating question:", error)
        throw error
    }
}

export async function updateQuestion(
    id: number,
    questionData: UpdateQuestionRequest
): Promise<Question | null> {
    try {
        const response = await questionAPI.updateQuestion(id, questionData)
        return response.data || null
    } catch (error) {
        console.error("Error updating question:", error)
        throw error
    }
}

export async function deleteQuestion(id: number): Promise<boolean> {
    try {
        await questionAPI.deleteQuestion(id)
        return true
    } catch (error) {
        console.error("Error deleting question:", error)
        throw error
    }
}
