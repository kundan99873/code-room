const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" && input.startsWith("/api")
    ? `${API_BASE_URL}${input}`
    : input;

  const options: RequestInit = {
    ...init,
    credentials: init?.credentials || "include",
  };

  return fetch(url, options);
};
