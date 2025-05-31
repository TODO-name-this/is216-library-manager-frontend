const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Get JWT token from localStorage
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("jwt_token")
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
        }
    }
    return {}
}

async function get(url: string, includeAuth = true) {
    const headers: Record<string, string> = includeAuth ? getAuthHeaders() : {}
    const requestOptions: RequestInit = {
        method: "GET",
        headers,
    }

    console.log("Client fetch to:", baseUrl + url)
    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function post(url: string, body: {}, includeAuth = true) {
    const authHeaders = includeAuth ? getAuthHeaders() : {}
    const headers: Record<string, string> = {
        "Content-type": "application/json",
        ...authHeaders,
    }
    const requestOptions: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    }
    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function put(url: string, body: {}, includeAuth = true) {
    const authHeaders = includeAuth ? getAuthHeaders() : {}
    const headers: Record<string, string> = {
        "Content-type": "application/json",
        ...authHeaders,
    }
    const requestOptions: RequestInit = {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    }

    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function del(url: string, includeAuth = true) {
    const headers: Record<string, string> = includeAuth ? getAuthHeaders() : {}
    const requestOptions: RequestInit = {
        method: "DELETE",
        headers,
    }

    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function patch(url: string, body: {}, includeAuth = true) {
    const authHeaders = includeAuth ? getAuthHeaders() : {}
    const headers: Record<string, string> = {
        "Content-type": "application/json",
        ...authHeaders,
    }
    const requestOptions: RequestInit = {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
    }

    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function handleResponse(response: Response) {
    const text = await response.text()
    let data
    try {
        data = text && JSON.parse(text)
    } catch (error) {
        data = text
    }

    if (response.ok) {
        return data || response.statusText
    } else {
        const error = {
            status: response.status,
            message: typeof data === "string" ? data : response.statusText,
        }
        return { error }
    }
}

export const fetchWrapper = {
    get,
    post,
    put,
    del,
    patch,
}

// Default export for easier importing
export default fetchWrapper
