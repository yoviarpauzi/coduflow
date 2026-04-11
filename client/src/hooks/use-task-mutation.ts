import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  updateTaskLoggedTime,
  updateTaskPosition,
} from "@/lib/api/task";

export const useTaskMutation = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: invalidate,
  });

  const updateLoggedTimeMutation = useMutation({
    mutationFn: updateTaskLoggedTime,
    onSuccess: invalidate,
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateTaskPosition,
    onSuccess: invalidate,
  });

  return {
    createTask: createMutation.mutate,
    updateTaskLoggedTime: updateLoggedTimeMutation.mutate,
    updateTaskPosition: updatePositionMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdatingLoggedTime: updateLoggedTimeMutation.isPending,
    isUpdatingPosition: updatePositionMutation.isPending,
  };
};
