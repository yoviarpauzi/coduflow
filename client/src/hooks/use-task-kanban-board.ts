import { useTaskMutation } from "@/hooks/use-task-mutation";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import { useUpdateTaskStatusDialog } from "@/hooks/use-update-task-status-dialog";
import { useTaskKanbanBoardData } from "@/hooks/use-task-kanban-board-data";
import { useTaskKanbanDialog } from "@/hooks/use-task-kanban-dialog";
import { useTaskKanbanDnd } from "@/hooks/use-task-kanban-dnd";

export const useTaskKanbanBoard = () => {
  const { createTask, updateTaskPosition, isCreating, isUpdatingPosition } =
    useTaskMutation();
  const {
    updateTaskStatus,
    updateTaskStatusPosition,
    deleteTaskStatus,
    isUpdating: isUpdatingTaskStatus,
  } = useTaskStatusMutation();

  const { statuses, tasks, setStatuses, setTasks, tasksRef, statusesRef } =
    useTaskKanbanBoardData();

  const taskDialogVm = useTaskKanbanDialog({
    tasks,
    createTask,
    isCreatingTask: isCreating,
    isUpdatingTaskPosition: isUpdatingPosition,
  });

  const taskStatusDialogVm = useUpdateTaskStatusDialog({ updateTaskStatus });

  const handleDeleteTaskStatus = (statusId: string) => {
    if (
      confirm("Are you sure you want to delete this status and all its tasks?")
    ) {
      deleteTaskStatus({ id: statusId });
    }
  };

  const dnd = useTaskKanbanDnd({
    statuses,
    tasks,
    setStatuses,
    setTasks,
    tasksRef,
    statusesRef,
    onAddTask: taskDialogVm.openAddTaskDialog,
    onDeleteTaskStatus: handleDeleteTaskStatus,
    onEditTaskStatus: taskStatusDialogVm.openEditTaskStatusDialog,
    updateTaskPosition,
    updateTaskStatusPosition,
  });

  const taskDialog = taskDialogVm.taskDialog;

  const taskStatusDialog = {
    open: taskStatusDialogVm.isTaskStatusDialogOpen,
    onOpenChange: taskStatusDialogVm.handleTaskStatusDialogOpenChange,
    mode: "update" as const,
    title: taskStatusDialogVm.editingTaskStatusTitle,
    setTitle: taskStatusDialogVm.setEditingTaskStatusTitle,
    isComplete: taskStatusDialogVm.editingTaskStatusIsComplete,
    setIsComplete: taskStatusDialogVm.setEditingTaskStatusIsComplete,
    onSubmit: taskStatusDialogVm.submitTaskStatusUpdate,
    isSubmitting: isUpdatingTaskStatus,
  };

  return {
    dnd,
    taskDialog,
    taskStatusDialog,
  };
};
