import { apiFetch } from "./apiClient";

export interface Team {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  teamId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: {
      url: string;
    };
  };
  role: "owner" | "member";
  createdAt: string;
}

export const fetchUserTeams = async (): Promise<Team[]> => {
  const res = await apiFetch("/api/teams");
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "Failed to fetch teams");
  }
  const result = await res.json();
  const data = result.data || [];
  return data.map((t: any) => ({ ...t, id: t._id }));
};

export const fetchTeamDetails = async (
  teamId: string
): Promise<{ team: Team; members: TeamMember[]; rooms: any[]; role: "owner" | "member" }> => {
  const res = await apiFetch(`/api/teams/${teamId}`);
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "Failed to fetch team details");
  }
  const result = await res.json();
  const data = result.data;
  if (data && data.team) {
    data.team.id = data.team._id;
  }
  if (data && data.rooms) {
    data.rooms = data.rooms.map((r: any) => ({ ...r, id: r._id }));
  }
  return data;
};

export const createTeamRequest = async (teamData: {
  name: string;
  description?: string;
}): Promise<Team> => {
  const res = await apiFetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamData),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to create team");
  }
  const data = result.data;
  if (data) {
    data.id = data._id;
  }
  return data;
};

export const addTeamMemberRequest = async (
  teamId: string,
  email: string
): Promise<any> => {
  const res = await apiFetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to add member");
  }
  return result.data;
};

export const removeTeamMemberRequest = async (
  teamId: string,
  userId: string
): Promise<any> => {
  const res = await apiFetch(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to remove member");
  }
  return result.data;
};

export const deleteTeamRequest = async (teamId: string): Promise<any> => {
  const res = await apiFetch(`/api/teams/${teamId}`, {
    method: "DELETE",
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to delete team");
  }
  return result.data;
};
