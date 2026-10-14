const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('foodora_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('foodora_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('foodora_token');
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await response.json();
  if (!response.ok) {
    if (response.status === 401 && (json.message?.includes('Invalid token') || json.message?.includes('User not found'))) {
      removeAuthToken();
    }
    throw new Error(json.message || 'Something went wrong with the request');
  }

  return json;
};
