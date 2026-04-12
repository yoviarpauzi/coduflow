import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  updateTaskLoggedTime,
  updateTaskPosition,
} from "@/lib/api/task";
import { tasksKeys } from "@/lib/query-keys/tasks";
import type { Task } from "@/types/task";

const cloneTaskList = (items: Task[]) => items.map((item) => ({ ...item }));

const normalizeSearch = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const matchesTaskSearch = (task: Task, rawSearch: unknown) => {
  const search = normalizeSearch(rawSearch);
  if (!search) return true;
  return (
    task.title.toLowerCase().includes(search) ||
    task.description.toLowerCase().includes(search)
  );
};

type TaskPatch = {
  queryKey: readonly unknown[];
  previousTask: Task;
};

export const useTaskMutation = () => {
  const queryClient = useQueryClient();

  const invalidateTasksActive = () => {
    queryClient.invalidateQueries({
      queryKey: tasksKeys.all,
      refetchType: "active",
    });
  };

  const getTaskQueries = () =>
    queryClient.getQueriesData<Task[]>({ queryKey: tasksKeys.all });

  const restoreTaskPatches = (patches: TaskPatch[]) => {
    patches.forEach(({ queryKey, previousTask }) => {
      queryClient.setQueryData<Task[]>(queryKey, (oldData) => {
        const current = oldData ?? [];
        const taskIndex = current.findIndex((task) => task.id === previousTask.id);
        if (taskIndex === -1) {
          return cloneTaskList([...current, previousTask]);
        }
        return cloneTaskList(
          current.map((task) =>
            task.id === previousTask.id ? previousTask : task,
          ),
        );
      });
    });
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });
      const taskQueries = getTaskQueries();

      const optimisticTask: Task = {
        id: `optimistic-task-${Date.now()}`,
        title: variables.name,
        description: variables.description,
        priority: "None",
        progress: 0,
        members: [],
        attachments: 0,
        comments: 0,
        taskStatusId: variables.taskStatusId,
        position: variables.position,
        loggedTime: 0,
      };

      const insertedQueryKeys: Array<readonly unknown[]> = [];

      taskQueries.forEach(([queryKey, data]) => {
        const current = data ?? [];
        if (!matchesTaskSearch(optimisticTask, queryKey[1])) return;
        insertedQueryKeys.push(queryKey);
        queryClient.setQueryData<Task[]>(queryKey, () =>
          cloneTaskList([...current, optimisticTask]),
        );
      });

      return { optimisticTaskId: optimisticTask.id, insertedQueryKeys };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        invalidateTasksActive();
        return;
      }

      context.insertedQueryKeys.forEach((queryKey) => {
        queryClient.setQueryData<Task[]>(queryKey, (oldData) => {
          const current = oldData ?? [];
          return cloneTaskList(
            current.filter((task) => task.id !== context.optimisticTaskId),
          );
        });
      });
    },
    onSuccess: (createdTask, _variables, context) => {
      const taskQueries = getTaskQueries();
      taskQueries.forEach(([queryKey, data]) => {
        const current = data ?? [];
        const hasOptimisticTask = context
          ? current.some((task) => task.id === context.optimisticTaskId)
          : false;
        const shouldInclude = matchesTaskSearch(createdTask, queryKey[1]);
        if (!hasOptimisticTask && !shouldInclude) return;

        const next = hasOptimisticTask
          ? current.map((task) =>
              context && task.id === context.optimisticTaskId
                ? createdTask
                : task,
            )
          : [...current, createdTask];

        queryClient.setQueryData<Task[]>(queryKey, () => cloneTaskList(next));
      });
    },
    onSettled: invalidateTasksActive,
  });

  const updateLoggedTimeMutation = useMutation({
    mutationFn: updateTaskLoggedTime,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });
      const taskQueries = getTaskQueries();
      const patches: TaskPatch[] = [];

      taskQueries.forEach(([queryKey, data]) => {
        const current = data ?? [];
        const previousTask = current.find((task) => task.id === variables.id);
        if (!previousTask) return;
        patches.push({ queryKey, previousTask: { ...previousTask } });
        const next = current.map((task) =>
          task.id === variables.id
            ? { ...task, loggedTime: variables.loggedTime }
            : task,
        );
        queryClient.setQueryData<Task[]>(queryKey, () => cloneTaskList(next));
      });

      return { patches };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        invalidateTasksActive();
        return;
      }
      restoreTaskPatches(context.patches);
    },
    onSettled: invalidateTasksActive,
  });

  const updatePositionMutation = useMutation({
    mutationFn: updateTaskPosition,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tasksKeys.all });
      const taskQueries = getTaskQueries();
      const patches: TaskPatch[] = [];

      taskQueries.forEach(([queryKey, data]) => {
        const current = data ?? [];
        const previousTask = current.find((task) => task.id === variables.id);
        if (!previousTask) return;
        patches.push({ queryKey, previousTask: { ...previousTask } });
        const next = current.map((task) =>
          task.id === variables.id
            ? {
                ...task,
                position: variables.position,
                taskStatusId: variables.taskStatusId,
              }
            : task,
        );
        queryClient.setQueryData<Task[]>(queryKey, () => cloneTaskList(next));
      });

      return { patches };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        invalidateTasksActive();
        return;
      }
      restoreTaskPatches(context.patches);
    },
    onSettled: invalidateTasksActive,
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
