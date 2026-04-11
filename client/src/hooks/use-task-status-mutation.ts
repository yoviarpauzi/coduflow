import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStatus,
  updateTaskStatus,
  updateTaskStatusPosition,
  deleteTaskStatus,
} from "@/lib/api/task-status";

export const useTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["statuses"] });
  };

  const createMutation = useMutation({
    mutationFn: createStatus,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: invalidate,
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateTaskStatusPosition,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskStatus,
    onSuccess: invalidate,
  });

  return {
    createStatus: createMutation.mutate,
    updateTaskStatus: updateMutation.mutate,
    updateTaskStatusPosition: updatePositionMutation.mutate,
    deleteTaskStatus: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingPosition: updatePositionMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
