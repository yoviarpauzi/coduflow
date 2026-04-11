import type { Task } from "@/types/task";
import { config } from "@/lib/config";

const API_URL = `${config.apiBaseUrl}/api/v1/task`;

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export type CreateTaskPayload = {
  name: string;
  taskStatusId: string;
  position: number;
  description: string;
};

export type GetTasksParams = {
  search?: string;
};

export type UpdateTaskLoggedTimePayload = {
  id: string;
  loggedTime: number;
};

export type UpdateTaskPositionPayload = {
  id: string;
  position: number;
  taskStatusId: string;
};

export async function createTask({
  name,
  taskStatusId,
  position,
  description,
}: CreateTaskPayload): Promise<Task> {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      task_status_id: taskStatusId,
      position,
      description,
    }),
  });

  if (!response.ok) throw new Error("Failed to create task");

  const json: APIResponse<Task> = await response.json();
  return json.data;
}

export async function getTasks({ search }: GetTasksParams): Promise<Task[]> {
  const url = new URL(`${API_URL}`);

  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error("Failed to fetch tasks");

  const json: APIResponse<Task[]> = await response.json();
  return json.data || [];
}

export async function updateTaskLoggedTime({
  id,
  loggedTime,
}: UpdateTaskLoggedTimePayload): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}/logged-time`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logged_time: loggedTime }),
  });

  if (!response.ok) throw new Error("Failed to update logged time");

  const json: APIResponse<Task> = await response.json();
  return json.data;
}

export async function updateTaskPosition({
  id,
  position,
  taskStatusId,
}: UpdateTaskPositionPayload): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}/position`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position,
      task_status_id: taskStatusId,
    }),
  });

  if (!response.ok) throw new Error("Failed to update task position");

  const json: APIResponse<Task> = await response.json();
  return json.data;
}
