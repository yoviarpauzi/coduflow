import type { Task } from "@/types/task";

const API_URL = "http://localhost:8080/api/v1";

interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: any;
}

export async function getTasks(search?: string): Promise<Task[]> {
  const url = new URL(`${API_URL}/task`);
  if (search) {
    url.searchParams.append("search", search);
  }
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const json: APIResponse<Task[]> = await response.json();
  return json.data || [];
}

export async function updateTaskStatus(
  taskId: string,
  taskStatusId: string,
): Promise<Task> {
  const response = await fetch(`${API_URL}/task/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_status_id: taskStatusId }),
  });
  if (!response.ok) throw new Error("Failed to update task status");
  const json: APIResponse<Task> = await response.json();
  return json.data;
}

export async function updateLoggedTime(
  taskId: string,
  loggedTime: number,
): Promise<Task> {
  const response = await fetch(`${API_URL}/task/${taskId}/logged-time`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logged_time: loggedTime }),
  });
  if (!response.ok) throw new Error("Failed to update logged time");
  const json: APIResponse<Task> = await response.json();
  return json.data;
}

export async function createTask(
  name: string,
  taskStatusId: string,
  position: number,
  description?: string,
): Promise<Task> {
  const response = await fetch(`${API_URL}/task`, {
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

export async function updateTask(
  taskId: string,
  payload: Partial<{
    name: string;
    description: string;
    task_status_id: string;
    position: number;
    logged_time: number;
  }>,
): Promise<Task> {
  const response = await fetch(`${API_URL}/task/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update task");
  const json: APIResponse<Task> = await response.json();
  return json.data;
}

export async function patchTaskPosition(
  taskId: string,
  position: number,
  taskStatusId: string,
): Promise<Task> {
  const response = await fetch(`${API_URL}/task/${taskId}/position`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position, task_status_id: taskStatusId }),
  });
  if (!response.ok) throw new Error("Failed to update task position");
  const json: APIResponse<Task> = await response.json();
  return json.data;
}
