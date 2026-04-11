import { config } from "@/lib/config";
import type { TaskStatus } from "@/types/task-status";

const API_URL = `${config.apiBaseUrl}/api/v1/task-status`;

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export type CreateTaskStatusPayload = {
  title: string;
  position: number;
  isComplete?: boolean;
};

export type UpdateTaskStatusPayload = {
  id: string;
  title?: string;
  position?: number;
  isComplete?: boolean;
};

export type UpdateTaskStatusPositionPayload = {
  id: string;
  position: number;
};

export async function getTaskStatus(): Promise<TaskStatus[]> {
  const response = await fetch(`${API_URL}`);
  if (!response.ok) throw new Error("Failed to fetch statuses");
  const json: APIResponse<TaskStatus[]> = await response.json();
  return json.data || [];
}

export async function createStatus({
  title,
  position,
  isComplete = false,
}: CreateTaskStatusPayload): Promise<TaskStatus> {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, position, isComplete }),
  });

  if (!response.ok) throw new Error("Failed to create status");

  const json: APIResponse<TaskStatus> = await response.json();
  return json.data;
}

export async function updateTaskStatus({
  id,
  ...payload
}: UpdateTaskStatusPayload): Promise<TaskStatus> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Failed to update status");

  const json: APIResponse<TaskStatus> = await response.json();
  return json.data;
}

export async function updateTaskStatusPosition({
  id,
  position,
}: UpdateTaskStatusPositionPayload): Promise<TaskStatus> {
  const response = await fetch(`${API_URL}/${id}/position`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position }),
  });

  if (!response.ok) throw new Error("Failed to update status position");

  const json: APIResponse<TaskStatus> = await response.json();
  return json.data;
}

export async function deleteTaskStatus({
  id,
}: {
  id: string;
}): Promise<boolean> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete status");

  return true;
}
