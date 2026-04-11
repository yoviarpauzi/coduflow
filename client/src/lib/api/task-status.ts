import type { Status } from "@/types/status";

const API_URL = "http://localhost:8080/api/v1/task-status";

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export async function getStatuses(): Promise<Status[]> {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) throw new Error("Failed to fetch statuses");
  const json: APIResponse<Status[]> = await response.json();
  return json.data || [];
}

export async function createStatus(
  title: string,
  position: number,
  isComplete: boolean = false,
): Promise<Status> {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position, isComplete }),
  });
  if (!response.ok) throw new Error("Failed to create status");
  const json: APIResponse<Status> = await response.json();
  return json.data;
}

export async function updateStatus(
  statusId: string,
  payload: Partial<{
    title: string;
    position: number;
    isComplete: boolean;
  }>,
): Promise<Status> {
  const response = await fetch(`${API_URL}/${statusId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update status");
  const json: APIResponse<Status> = await response.json();
  return json.data;
}

export async function patchStatusPosition(
  statusId: string,
  position: number,
): Promise<import("@/types/status").Status> {
  const response = await fetch(`${API_URL}/${statusId}/position`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position }),
  });
  if (!response.ok) throw new Error("Failed to update status position");
  const json = await response.json();
  return json.data;
}

export async function deleteStatus(id: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete status");
  return true;
}
