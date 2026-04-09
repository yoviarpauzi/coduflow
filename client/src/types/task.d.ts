export type TaskPriority = "High" | "Medium" | "Low" | "None";

export interface TaskMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  progress: number;
  members: Member[];
  attachments: number;
  comments: number;
  columnId: string;
}
