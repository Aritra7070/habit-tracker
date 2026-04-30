const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_LOCATION = API_BASE_URL || "the configured /api proxy";

export async function apiRequest(endpoint, options = {}) {
  const { token, ...fetchOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  if (!isJson) {
    throw new Error(
      `Expected JSON but received ${contentType || "an unknown response type"}. Is the API server running at ${API_LOCATION}?`
    );
  }

  return data;
}
