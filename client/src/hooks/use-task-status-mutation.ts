import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStatus,
  updateTaskStatus,
  updateTaskStatusPosition,
  deleteTaskStatus,
} from "@/lib/api/task-status";
import { tasksKeys } from "@/lib/query-keys/tasks";
import type { TaskStatus } from "@/types/task-status";
import type { Task } from "@/types/task";

const cloneTaskStatusList = (items: TaskStatus[]) =>
  items.map((item) => ({ ...item }));
const cloneTaskList = (items: Task[]) => items.map((item) => ({ ...item }));

type RemovedTaskPatch = {
  queryKey: readonly unknown[];
  removedTasks: Array<{ task: Task; index: number }>;
};

export const useTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  const invalidateTaskStatusActive = () => {
    queryClient.invalidateQueries({
      queryKey: tasksKeys.statuses,
      refetchType: "active",
    });
  };

  const invalidateTasksActive = () => {
    queryClient.invalidateQueries({ queryKey: tasksKeys.all, refetchType: "active" });
  };

  const getTaskQueries = () =>
    queryClient.getQueriesData<Task[]>({ queryKey: tasksKeys.all });

  const createMutation = useMutation({
    mutationFn: createStatus,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.statuses });
      const previousStatuses = queryClient.getQueryData<TaskStatus[]>(
        tasksKeys.statuses,
      );
      const current = previousStatuses ?? [];
      const optimisticStatus: TaskStatus = {
        id: `optimistic-status-${Date.now()}`,
        title: variables.title,
        position: variables.position,
        isComplete: variables.isComplete ?? false,
      };

      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, () =>
        cloneTaskStatusList([...current, optimisticStatus]),
      );

      return { optimisticStatusId: optimisticStatus.id };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        invalidateTaskStatusActive();
        return;
      }
      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const current = oldData ?? [];
        return cloneTaskStatusList(
          current.filter((status) => status.id !== context.optimisticStatusId),
        );
      });
    },
    onSuccess: (createdStatus, _variables, context) => {
      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const current = oldData ?? [];
        const replaced = context
          ? current.map((status) =>
              status.id === context.optimisticStatusId ? createdStatus : status,
            )
          : current;
        const hasCreated = replaced.some((status) => status.id === createdStatus.id);
        return cloneTaskStatusList(hasCreated ? replaced : [...replaced, createdStatus]);
      });
    },
    onSettled: invalidateTaskStatusActive,
  });

  const updateMutation = useMutation({
    mutationFn: updateTaskStatus,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.statuses });
      const previousStatuses = queryClient.getQueryData<TaskStatus[]>(
        tasksKeys.statuses,
      );
      const current = previousStatuses ?? [];
      const next = current.map((status) =>
        status.id === variables.id ? { ...status, ...variables } : status,
      );

      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, () =>
        cloneTaskStatusList(next),
      );

      const previousStatus = current.find((status) => status.id === variables.id);
      return { previousStatus: previousStatus ? { ...previousStatus } : undefined };
    },
    onError: (_error, _variables, context) => {
      const previousStatus = context?.previousStatus;
      if (!previousStatus) {
        invalidateTaskStatusActive();
        return;
      }
      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const current = oldData ?? [];
        const hasStatus = current.some((status) => status.id === previousStatus.id);
        if (!hasStatus) return cloneTaskStatusList([...current, previousStatus]);
        return cloneTaskStatusList(
          current.map((status) =>
            status.id === previousStatus.id ? previousStatus : status,
          ),
        );
      });
    },
    onSettled: invalidateTaskStatusActive,
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateTaskStatusPosition,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.statuses });
      const previousStatuses = queryClient.getQueryData<TaskStatus[]>(
        tasksKeys.statuses,
      );
      const current = previousStatuses ?? [];
      const next = current.map((status) =>
        status.id === variables.id
          ? { ...status, position: variables.position }
          : status,
      );

      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, () =>
        cloneTaskStatusList(next),
      );

      const previousStatus = current.find((status) => status.id === variables.id);
      return { previousStatus: previousStatus ? { ...previousStatus } : undefined };
    },
    onError: (_error, _variables, context) => {
      const previousStatus = context?.previousStatus;
      if (!previousStatus) {
        invalidateTaskStatusActive();
        return;
      }
      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const current = oldData ?? [];
        const hasStatus = current.some((status) => status.id === previousStatus.id);
        if (!hasStatus) return cloneTaskStatusList([...current, previousStatus]);
        return cloneTaskStatusList(
          current.map((status) =>
            status.id === previousStatus.id ? previousStatus : status,
          ),
        );
      });
    },
    onSettled: invalidateTaskStatusActive,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTaskStatus,
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: tasksKeys.statuses }),
        queryClient.cancelQueries({ queryKey: tasksKeys.all }),
      ]);

      const previousStatuses = queryClient.getQueryData<TaskStatus[]>(
        tasksKeys.statuses,
      );
      const previousTasks = getTaskQueries();
      const currentStatuses = previousStatuses ?? [];
      const deletedStatusIndex = currentStatuses.findIndex(
        (status) => status.id === variables.id,
      );
      const deletedStatus =
        deletedStatusIndex === -1 ? undefined : currentStatuses[deletedStatusIndex];

      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const current = oldData ?? [];
        return cloneTaskStatusList(
          current.filter((status) => status.id !== variables.id),
        );
      });

      const removedTaskPatches: RemovedTaskPatch[] = [];
      previousTasks.forEach(([queryKey, data]) => {
        const current = data ?? [];
        const removedTasks = current
          .map((task, index) => ({ task: { ...task }, index }))
          .filter(({ task }) => task.taskStatusId === variables.id);
        if (removedTasks.length > 0) {
          removedTaskPatches.push({ queryKey, removedTasks });
        }
        const next = current.filter((task) => task.taskStatusId !== variables.id);
        queryClient.setQueryData<Task[]>(queryKey, () => cloneTaskList(next));
      });

      return { deletedStatus, deletedStatusIndex, removedTaskPatches };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        invalidateTaskStatusActive();
        invalidateTasksActive();
        return;
      }

      if (context.deletedStatus) {
        const deletedStatus = context.deletedStatus;
        queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
          const current = oldData ?? [];
          const hasStatus = current.some((status) => status.id === deletedStatus.id);
          if (hasStatus) return cloneTaskStatusList(current);

          const insertAt = Math.max(
            0,
            Math.min(context.deletedStatusIndex, current.length),
          );
          const next = [...current];
          next.splice(insertAt, 0, deletedStatus);
          return cloneTaskStatusList(next);
        });
      }

      context.removedTaskPatches.forEach(({ queryKey, removedTasks }) => {
        queryClient.setQueryData<Task[]>(queryKey, (oldData) => {
          const current = oldData ?? [];
          const next = [...current];

          removedTasks
            .slice()
            .sort((a, b) => a.index - b.index)
            .forEach(({ task, index }) => {
              if (next.some((item) => item.id === task.id)) return;
              const insertAt = Math.max(0, Math.min(index, next.length));
              next.splice(insertAt, 0, task);
            });

          return cloneTaskList(next);
        });
      });
    },
    onSettled: () => {
      invalidateTaskStatusActive();
      invalidateTasksActive();
    },
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
