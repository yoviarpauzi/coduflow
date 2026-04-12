import { useTaskMutation } from "@/hooks/use-task-mutation";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";

export const useKanbanMutations = () => {
  const { createTask, updateTaskPosition, isCreating, isUpdatingPosition } =
    useTaskMutation();
  const {
    updateTaskStatus,
    updateTaskStatusPosition,
    deleteTaskStatus,
    isUpdating,
  } = useTaskStatusMutation();

  return {
    createTask,
    updateTaskPosition,
    updateTaskStatus,
    updateTaskStatusPosition,
    deleteTaskStatus,
    isCreatingTask: isCreating,
    isUpdatingTaskPosition: isUpdatingPosition,
    isUpdatingTaskStatus: isUpdating,
  };
};
