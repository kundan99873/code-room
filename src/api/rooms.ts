export interface Room {
  id: string;
  name: string;
  language: string;
  code: string;
  owner_id: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
}

export interface RoomFile {
  id: string;
  room_id: string;
  name: string;
  language: string;
  content: string;
  position: number;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      publicId: string;
      url: string;
    };
  };
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  roomId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      publicId: string;
      url: string;
    };
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

import { apiFetch } from "./apiClient";

const handleResponse = async (res: Response) => {
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(result.message || "Request failed");
    err.status = res.status;
    err.error = result.error; // Custom details like { isPrivate: true, requestStatus: "pending" }
    throw err;
  }
  return result.data !== undefined ? result.data : result;
};

// Rooms API
export const createRoom = async (roomData: { name: string; language?: string; isPublic?: boolean }): Promise<any> => {
  const res = await apiFetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });
  return handleResponse(res);
};

export const fetchUserRooms = async (): Promise<any[]> => {
  const res = await apiFetch("/api/rooms/my");
  return handleResponse(res);
};

export const fetchRoom = async (roomId: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}`);
  return handleResponse(res);
};

export const updateRoom = async (roomId: string, roomData: { name?: string; language?: string; isPublic?: boolean }): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomData),
  });
  return handleResponse(res);
};

export const deleteRoom = async (roomId: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

// Members API
export const fetchRoomMembers = async (roomId: string): Promise<any[]> => {
  const res = await apiFetch(`/api/rooms/${roomId}/members`);
  return handleResponse(res);
};

export const addRoomMember = async (roomId: string, email: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
};

export const removeRoomMember = async (roomId: string, userId: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/members/${userId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const updateRoomMemberRole = async (roomId: string, userId: string, role: "admin" | "member"): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/members/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
};

// Files API
export const fetchRoomFiles = async (roomId: string): Promise<any[]> => {
  const res = await apiFetch(`/api/rooms/${roomId}/files`);
  return handleResponse(res);
};

export const createRoomFile = async (roomId: string, fileData: { name: string; language?: string; content?: string }): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fileData),
  });
  return handleResponse(res);
};

export const updateRoomFile = async (roomId: string, fileId: string, fileData: { name?: string; language?: string; content?: string }): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fileData),
  });
  return handleResponse(res);
};

export const deleteRoomFile = async (roomId: string, fileId: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/files/${fileId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

// Join Requests API
export const createJoinRequest = async (roomId: string): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/join`, {
    method: "POST",
  });
  return handleResponse(res);
};

export const fetchJoinRequests = async (roomId: string): Promise<any[]> => {
  const res = await apiFetch(`/api/rooms/${roomId}/join-requests`);
  return handleResponse(res);
};

export const handleJoinRequest = async (roomId: string, requestId: string, status: "approved" | "rejected"): Promise<any> => {
  const res = await apiFetch(`/api/rooms/${roomId}/join-requests/${requestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
};
