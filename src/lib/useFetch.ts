"use client"

import { fetchWrapper } from "@/lib/fetchWrapper"
import { useCallback } from "react"

export function useFetch() {
    const get = useCallback(async (url: string) => {
        return fetchWrapper.get(url, false)
    }, [])

    const post = useCallback(async (url: string, body: {}) => {
        return fetchWrapper.post(url, body, false)
    }, [])

    const put = useCallback(async (url: string, body: {}) => {
        return fetchWrapper.put(url, body, false)
    }, [])

    const patch = useCallback(async (url: string, body: {}) => {
        return fetchWrapper.patch(url, body, false)
    }, [])

    const del = useCallback(async (url: string) => {
        return fetchWrapper.del(url, false)
    }, [])

    return { get, post, put, patch, del }
}
