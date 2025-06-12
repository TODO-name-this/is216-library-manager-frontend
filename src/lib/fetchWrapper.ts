const baseUrl = process.env.NEXT_PUBLIC_API_URL 

// Get JWT token from localStorage
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("access_token")
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
        // Handle 401 Unauthorized errors only for authenticated requests
        if (response.status === 401) {
            // Check if this was an authenticated request by looking at the URL
            // Only redirect for protected endpoints, not public ones like book listings
            const url = response.url
            const isPublicEndpoint =
                url.includes("/bookTitle/names") ||
                url.includes("/bookTitle/with-names") ||
                url.includes("/auth/login")

            if (!isPublicEndpoint) {
                // Clear stored authentication data
                localStorage.removeItem("access_token")
                localStorage.removeItem("user_info")

                // Redirect to login page if we're in the browser
                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
            }
        }

        const error = {
            status: response.status,
            message: typeof data === "string" ? data : response.statusText,
        }
        console.error("Fetch error:", error)
        throw new Error(`HTTP ${response.status}: ${error.message}`)
    }
}

export const fetchWrapper = {
    get,
    post,
    put,
    del,
    patch,
}
