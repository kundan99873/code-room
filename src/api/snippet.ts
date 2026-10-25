import { apiFetch } from "./apiClient";

export interface Snippet {
  _id: string;
  shortId: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  authorId?: {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  authorName: string;
  isPublic: boolean;
  views: number;
  forkedFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetInput {
  title?: string;
  code: string;
  language: string;
  description?: string;
  isPublic?: boolean;
}

export interface SnippetResponse {
  success: boolean;
  message: string;
  data: {
    snippet: Snippet;
    shareUrl: string;
    embedUrl: string;
  };
}

export const createSnippet = async (input: CreateSnippetInput): Promise<SnippetResponse> => {
  const res = await apiFetch("/api/snippets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to create snippet");
  }
  return json;
};

export const getSnippet = async (shortId: string): Promise<SnippetResponse> => {
  const res = await apiFetch(`/api/snippets/${shortId}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Snippet not found");
  }
  return json;
};

export const forkSnippet = async (shortId: string): Promise<SnippetResponse> => {
  const res = await apiFetch(`/api/snippets/${shortId}/fork`, {
    method: "POST",
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to fork snippet");
  }
  return json;
};

export const getMySnippets = async (): Promise<{ success: boolean; data: Snippet[] }> => {
  const res = await apiFetch("/api/snippets/my/all");
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch user snippets");
  }
  return json;
};
