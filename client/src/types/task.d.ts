export type TaskPriority = "High" | "Medium" | "Low" | "None";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  progress: number;
  members: Member[];
  attachments: number;
  comments: number;
  taskStatusId: string;
  position: number;
  loggedTime: number;
}
