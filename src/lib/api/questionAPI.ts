import { fetchWrapper } from "../fetchWrapper"
import {
    Question,
    CreateQuestionRequest,
    UpdateQuestionRequest,
    ApiResponse,
} from "./types"

export const questionAPI = {
    // Get all questions
    getQuestions: async (): Promise<ApiResponse<Question[]>> => {
        try {
            const response = await fetchWrapper.get("/question")
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch questions" },
            }
        }
    },

    // Get question by ID
    getQuestionById: async (id: number): Promise<ApiResponse<Question>> => {
        try {
            const response = await fetchWrapper.get(`/api/question/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch question" },
            }
        }
    },

    // Create new question
    createQuestion: async (
        questionData: CreateQuestionRequest
    ): Promise<ApiResponse<Question>> => {
        try {
            const response = await fetchWrapper.post(
                "/question",
                questionData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create question" },
            }
        }
    },

    // Update question (typically to add an answer)
    updateQuestion: async (
        id: number,
        questionData: UpdateQuestionRequest
    ): Promise<ApiResponse<Question>> => {
        try {
            const response = await fetchWrapper.put(
                `/api/question/${id}`,
                questionData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update question" },
            }
        }
    },

    // Delete question
    deleteQuestion: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/question/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete question" },
            }
        }
    },
}

