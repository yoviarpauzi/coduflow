import { useTaskKanbanDialog } from "@/hooks/use-task-kanban-dialog";
import { useUpdateTaskStatusDialog } from "@/hooks/use-update-task-status-dialog";
import type { Task } from "@/types/task";

type CreateTaskFn = (
  payload: {
    name: string;
    taskStatusId: string;
    position: number;
    description: string;
  },
  options?: { onSuccess?: () => void },
) => void;

type UpdateTaskStatusFn = (
  payload: {
    id: string;
    title?: string;
    isComplete?: boolean;
  },
  options?: { onSuccess?: () => void },
) => void;

type DeleteTaskStatusFn = (payload: { id: string }) => void;

type UseKanbanUIParams = {
  tasks: Task[];
  createTask: CreateTaskFn;
  updateTaskStatus: UpdateTaskStatusFn;
  deleteTaskStatus: DeleteTaskStatusFn;
  isCreatingTask: boolean;
  isUpdatingTaskPosition: boolean;
  isUpdatingTaskStatus: boolean;
};

export const useKanbanUI = ({
  tasks,
  createTask,
  updateTaskStatus,
  deleteTaskStatus,
  isCreatingTask,
  isUpdatingTaskPosition,
  isUpdatingTaskStatus,
}: UseKanbanUIParams) => {
  const taskDialogVm = useTaskKanbanDialog({
    tasks,
    createTask,
    isCreatingTask,
    isUpdatingTaskPosition,
  });
  const taskStatusDialogVm = useUpdateTaskStatusDialog({ updateTaskStatus });

  const onDeleteTaskStatus = (statusId: string) => {
    if (
      confirm("Are you sure you want to delete this status and all its tasks?")
    ) {
      deleteTaskStatus({ id: statusId });
    }
  };

  return {
    taskDialog: taskDialogVm.taskDialog,
    taskStatusDialog: {
      open: taskStatusDialogVm.isTaskStatusDialogOpen,
      onOpenChange: taskStatusDialogVm.handleTaskStatusDialogOpenChange,
      mode: "update" as const,
      title: taskStatusDialogVm.editingTaskStatusTitle,
      setTitle: taskStatusDialogVm.setEditingTaskStatusTitle,
      isComplete: taskStatusDialogVm.editingTaskStatusIsComplete,
      setIsComplete: taskStatusDialogVm.setEditingTaskStatusIsComplete,
      onSubmit: taskStatusDialogVm.submitTaskStatusUpdate,
      isSubmitting: isUpdatingTaskStatus,
    },
    onAddTask: taskDialogVm.openAddTaskDialog,
    onEditTaskStatus: taskStatusDialogVm.openEditTaskStatusDialog,
    onDeleteTaskStatus,
  };
};
