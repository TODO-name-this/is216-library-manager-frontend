'use client';

import { useAuth0 } from "@auth0/auth0-react";
import { fetchWrapper } from "@/lib/fetchWrapper";
import { useCallback } from "react";

export function useFetch() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    
    const getAuthHeaders = useCallback(async () => {
        if (!isAuthenticated) return {};
        
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                    audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
                    scope: "read:current_user",
                },
            });
            
            return {
                "Authorization": `Bearer ${accessToken}`
            };
        } catch (e) {
            console.error("Error getting access token:", e);
            return {};
        }
    }, [getAccessTokenSilently, isAuthenticated]);
    
    const get = useCallback(async (url: string) => {
        const headers = await getAuthHeaders();
        return fetchWrapper.get(url, headers);
    }, [getAuthHeaders]);
    
    const post = useCallback(async (url: string, body: {}) => {
        const headers = await getAuthHeaders();
        return fetchWrapper.post(url, body, headers);
    }, [getAuthHeaders]);
    
    const put = useCallback(async (url: string, body: {}) => {
        const headers = await getAuthHeaders();
        return fetchWrapper.put(url, body, headers);
    }, [getAuthHeaders]);

    const patch = useCallback(async (url: string, body: {}) => {
        const headers = await getAuthHeaders();
        return fetchWrapper.patch(url, body, headers);
    }, [getAuthHeaders]);

    const del = useCallback(async (url: string) => {
        const headers = await getAuthHeaders();
        return fetchWrapper.del(url, headers);
    }, [getAuthHeaders]);
    
    return { get, post, put, patch, del };
}