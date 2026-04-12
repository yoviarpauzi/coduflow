import { useState } from "react";
import { getAppendPosition } from "@/lib/kanban-position";
import type { Task } from "@/types/task";
import type { TaskDialogModel } from "@/types/task-ui-models";

type CreateTaskFn = (
  payload: {
    name: string;
    taskStatusId: string;
    position: number;
    description: string;
  },
  options?: { onSuccess?: () => void },
) => void;

type UseKanbanTaskDialogParams = {
  tasks: Task[];
  createTask: CreateTaskFn;
  isCreatingTask: boolean;
  isUpdatingTaskPosition: boolean;
};

export const useTaskKanbanDialog = ({
  tasks,
  createTask,
  isCreatingTask,
  isUpdatingTaskPosition,
}: UseKanbanTaskDialogParams) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskStatusId, setTaskStatusId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const openAddTaskDialog = (statusId: string) => {
    setTaskStatusId(statusId);
    setIsTaskDialogOpen(true);
  };

  const submitTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle || !taskStatusId) return;

    const colTasks = tasks.filter((task) => task.taskStatusId === taskStatusId);
    const insertPos = getAppendPosition(colTasks);

    createTask(
      {
        name: trimmedTitle,
        taskStatusId,
        position: insertPos,
        description: newTaskDesc,
      },
      {
        onSuccess: () => {
          setIsTaskDialogOpen(false);
          setNewTaskTitle("");
          setNewTaskDesc("");
        },
      },
    );
  };

  const taskDialog: TaskDialogModel = {
    open: isTaskDialogOpen,
    onOpenChange: setIsTaskDialogOpen,
    mode: "create",
    title: newTaskTitle,
    setTitle: setNewTaskTitle,
    description: newTaskDesc,
    setDescription: setNewTaskDesc,
    onSubmit: submitTask,
    isSubmitting: isCreatingTask,
    disableSubmit: isUpdatingTaskPosition || !newTaskTitle,
  };

  return {
    openAddTaskDialog,
    taskDialog,
  };
};
