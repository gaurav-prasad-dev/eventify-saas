const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let currentAccessToken = null;
let currentOrgId = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

export const setActiveOrgId = (orgId) => {
  currentOrgId = orgId;
};

export const getActiveOrgId = () => currentOrgId;

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (currentAccessToken) {
    headers['Authorization'] = `Bearer ${currentAccessToken}`;
  }

  if (currentOrgId && !headers['x-organization-id']) {
    headers['x-organization-id'] = currentOrgId;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, config);

    if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/otp') && !endpoint.includes('/auth/refresh')) {
      options._retry = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.data?.accessToken) {
            setAccessToken(refreshData.data.accessToken);
            headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            return await fetch(url, { ...config, headers });
          }
        }
      } catch (err) {
        // Refresh failed
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  patch: (endpoint, body, headers) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
  upload: (endpoint, formData, headers) =>
    apiRequest(endpoint, { method: 'POST', body: formData, headers }),
};
