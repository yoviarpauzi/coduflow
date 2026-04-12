import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTaskStatus } from "@/lib/api/task-status";
import { tasksKeys } from "@/lib/query-keys/tasks";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import type { CreateTaskStatusDialogModel } from "@/types/task-ui-models";

export const useCreateTaskStatusDialog = () => {
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] = useState(false);
  const [taskStatusTitle, setTaskStatusTitle] = useState("");
  const [taskStatusIsComplete, setTaskStatusIsComplete] = useState(false);
  const { createStatus, isCreating } = useTaskStatusMutation();

  const { data: taskStatuses } = useQuery({
    queryKey: tasksKeys.statuses,
    queryFn: getTaskStatus,
  });

  const resetTaskStatusDialogState = () => {
    setTaskStatusTitle("");
    setTaskStatusIsComplete(false);
  };

  const handleTaskStatusDialogOpenChange = (open: boolean) => {
    setIsTaskStatusDialogOpen(open);
    if (!open) {
      resetTaskStatusDialogState();
    }
  };

  const openCreateTaskStatusDialog = () => {
    resetTaskStatusDialogState();
    handleTaskStatusDialogOpenChange(true);
  };

  const submitTaskStatus = () => {
    const trimmedTitle = taskStatusTitle.trim();
    if (!trimmedTitle) return;

    createStatus(
      {
        title: trimmedTitle,
        position: (taskStatuses?.length || 0) + 1,
        isComplete: taskStatusIsComplete,
      },
      {
        onSuccess: () => {
          handleTaskStatusDialogOpenChange(false);
        },
      },
    );
  };

  const taskStatusDialog: CreateTaskStatusDialogModel = {
    open: isTaskStatusDialogOpen,
    onOpenChange: handleTaskStatusDialogOpenChange,
    mode: "create",
    onOpenCreate: openCreateTaskStatusDialog,
    title: taskStatusTitle,
    setTitle: setTaskStatusTitle,
    isComplete: taskStatusIsComplete,
    setIsComplete: setTaskStatusIsComplete,
    onSubmit: submitTaskStatus,
    isSubmitting: isCreating,
  };

  return {
    taskStatusDialog,
  };
};
