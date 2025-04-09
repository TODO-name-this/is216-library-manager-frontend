const baseUrl = process.env.NEXT_PUBLIC_API_URL

async function get(url: string, headers = {}) {
    const requestOptions = {
        method: "GET",
        headers,
    };

    console.log("Client fetch to:", baseUrl + url);
    const response = await fetch(baseUrl + url, requestOptions);
    
    return handleResponse(response);
}

async function post(url: string, body: {}, headers = {}) {
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            ...headers
        },
        body: JSON.stringify(body)
    };
    const response = await fetch(baseUrl + url, requestOptions);

    return handleResponse(response);
}

async function put(url: string, body: {}, headers = {}) {
    const requestOptions = {
        method: 'PUT',
        headers: {
            "Content-type": "application/json",
            ...headers
        },
        body: JSON.stringify(body)
    }

    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function del(url: string, headers = {}) {
    const requestOptions = {
        method: 'DELETE',
        headers,
    }

    const response = await fetch(baseUrl + url, requestOptions)

    return handleResponse(response)
}

async function patch(url: string, body: {}, headers = {}) {
    const requestOptions = {
        method: 'PATCH',
        headers: {
            "Content-type": "application/json",
            ...headers
        },
        body: JSON.stringify(body)
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
