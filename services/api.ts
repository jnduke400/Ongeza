import { API_BASE_URL } from './apiConfig';

const refreshToken = async (): Promise<string | null> => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    if (!refreshTokenValue || !accessToken) {
        console.error("No refresh token or access token available for refresh.");
        localStorage.clear();
        sessionStorage.clear();
        window.location.hash = '/login';
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`, 
            },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.message || 'Session expired. Please log in again.');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        console.log("Token refreshed successfully.");
        return newAccessToken;
    } catch (error) {
        console.error("Token refresh failed:", error);
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('pinSet');
        sessionStorage.removeItem('pinBadgeDismissed');
        
        window.location.hash = '/login';
        return null;
    }
};

export const interceptedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!options.headers) {
        options.headers = {};
    }

    if (token) {
        (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    if (sessionId) {
        (options.headers as Record<string, string>)['X-Session-Id'] = sessionId;
    }
    
    let response = await fetch(url, options);

    if (response.status === 401) {
        const responseClone = response.clone();
        try {
            const errorData = await responseClone.json();

            if (errorData.code === "104") { // JWT token expired
                console.log("Access token expired, attempting to refresh...");
                const newAccessToken = await refreshToken();
                
                if (newAccessToken) {
                    console.log("Token refreshed, retrying original request.");
                    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
                    return fetch(url, options);
                } else {
                     // refreshToken function handles the redirect, but we return a response to stop the promise chain.
                     return new Response(JSON.stringify({ message: 'Session expired. Redirecting to login.' }), { status: 401 });
                }
            } else if (errorData.code === "101") { // Session expired
                console.log("Session expired, dispatching event to show modal.");
                const pinSet = localStorage.getItem('pinSet') === 'true';
                const currentPath = window.location.hash.substring(1);
                
                // Dispatch a custom event instead of redirecting directly
                const event = new CustomEvent('sessionExpired', {
                    detail: {
                        pinSet: pinSet,
                        from: currentPath,
                    }
                });
                window.dispatchEvent(event);

                // Return a promise that never resolves to stop further processing in the original component
                return new Promise(() => {});
            }
        } catch (e) {
            console.error("Could not parse 401 error response or refresh failed.", e);
        }
    }
    
    return response;
};