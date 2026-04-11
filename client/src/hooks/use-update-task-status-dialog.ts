import { useState } from "react";
import type { TaskStatus } from "@/types/task-status";

type UpdateTaskStatusPayload = {
  id: string;
  title?: string;
  isComplete?: boolean;
};

type UseUpdateTaskStatusDialogParams = {
  updateTaskStatus: (
    payload: UpdateTaskStatusPayload,
    options?: { onSuccess?: () => void },
  ) => void;
};

export const useUpdateTaskStatusDialog = ({
  updateTaskStatus,
}: UseUpdateTaskStatusDialogParams) => {
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] = useState(false);
  const [editingTaskStatusId, setEditingTaskStatusId] = useState<string | null>(
    null,
  );
  const [editingTaskStatusTitle, setEditingTaskStatusTitle] = useState("");
  const [editingTaskStatusIsComplete, setEditingTaskStatusIsComplete] =
    useState(false);

  const resetTaskStatusDialogState = () => {
    setEditingTaskStatusId(null);
    setEditingTaskStatusTitle("");
    setEditingTaskStatusIsComplete(false);
  };

  const handleTaskStatusDialogOpenChange = (open: boolean) => {
    setIsTaskStatusDialogOpen(open);
    if (!open) {
      resetTaskStatusDialogState();
    }
  };

  const openEditTaskStatusDialog = (taskStatus: TaskStatus) => {
    setEditingTaskStatusId(taskStatus.id);
    setEditingTaskStatusTitle(taskStatus.title);
    setEditingTaskStatusIsComplete(taskStatus.isComplete);
    setIsTaskStatusDialogOpen(true);
  };

  const submitTaskStatusUpdate = () => {
    const trimmedTitle = editingTaskStatusTitle.trim();
    if (!editingTaskStatusId || !trimmedTitle) return;

    updateTaskStatus(
      {
        id: editingTaskStatusId,
        title: trimmedTitle,
        isComplete: editingTaskStatusIsComplete,
      },
      {
        onSuccess: () => {
          handleTaskStatusDialogOpenChange(false);
        },
      },
    );
  };

  return {
    isTaskStatusDialogOpen,
    handleTaskStatusDialogOpenChange,
    editingTaskStatusTitle,
    setEditingTaskStatusTitle,
    editingTaskStatusIsComplete,
    setEditingTaskStatusIsComplete,
    openEditTaskStatusDialog,
    submitTaskStatusUpdate,
  };
};
