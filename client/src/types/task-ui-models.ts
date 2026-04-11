import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useSensors } from "@dnd-kit/core";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/types/task-status";

export type ActiveItem =
  | { type: "status"; status: TaskStatus }
  | { type: "task"; task: Task };

export type TaskKanbanDndModel = {
  statuses: TaskStatus[];
  tasks: Task[];
  activeItem: ActiveItem | null;
  dragWidth: number;
  setDragWidth: (width: number) => void;
  isStatusDragging: boolean;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onAddTask: (statusId: string) => void;
  onDeleteTaskStatus: (statusId: string) => void;
  onEditTaskStatus: (taskStatus: TaskStatus) => void;
};

export type TaskDialogModel = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disableSubmit: boolean;
};

type BaseTaskStatusDialogModel = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  isComplete: boolean;
  setIsComplete: (value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export type TaskStatusDialogModel = BaseTaskStatusDialogModel & {
  mode: "create" | "update";
};

export type CreateTaskStatusDialogModel = BaseTaskStatusDialogModel & {
  mode: "create";
  onOpenCreate: () => void;
};
