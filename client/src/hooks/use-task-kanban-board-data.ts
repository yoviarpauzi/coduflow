import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { getTaskStatus } from "@/lib/api/task-status";
import { getTasks } from "@/lib/api/task";
import { tasksKeys } from "@/lib/query-keys/tasks";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/types/task-status";

const cloneTaskList = (items: Task[]) => items.map((item) => ({ ...item }));
const cloneTaskStatusList = (items: TaskStatus[]) =>
  items.map((item) => ({ ...item }));

export const useTaskKanbanBoardData = () => {
  const queryClient = useQueryClient();

  const searchQuery = useSearch({ strict: false });
  const search = (searchQuery.search as string) ?? "";
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 2000);

    return () => clearTimeout(handler);
  }, [search]);

  const { data: fetchedStatuses } = useQuery({
    queryKey: tasksKeys.statuses,
    queryFn: getTaskStatus,
  });
  const { data: fetchedTasks } = useQuery({
    queryKey: tasksKeys.list({ search: debouncedSearch }),
    queryFn: () => getTasks({ search: debouncedSearch }),
  });

  const statuses = useMemo(() => fetchedStatuses ?? [], [fetchedStatuses]);
  const tasks = useMemo(() => fetchedTasks ?? [], [fetchedTasks]);

  const setStatuses = useCallback<Dispatch<SetStateAction<TaskStatus[]>>>(
    (next) => {
      queryClient.setQueryData<TaskStatus[]>(tasksKeys.statuses, (oldData) => {
        const prev = oldData ?? [];
        const resolved = typeof next === "function" ? next(prev) : next;
        return cloneTaskStatusList(resolved);
      });
    },
    [queryClient],
  );

  const setTasks = useCallback<Dispatch<SetStateAction<Task[]>>>(
    (next) => {
      const taskQueries = queryClient.getQueriesData<Task[]>({
        queryKey: tasksKeys.all,
      });

      taskQueries.forEach(([queryKey, data]) => {
        const prev = data ?? [];
        const resolved = typeof next === "function" ? next(prev) : next;
        queryClient.setQueryData<Task[]>(queryKey, () => cloneTaskList(resolved));
      });
    },
    [queryClient],
  );

  // These refs are transient snapshots for DnD event handlers only.
  // TanStack Query cache remains the single source of truth.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const statusesRef = useRef(statuses);
  statusesRef.current = statuses;

  return {
    statuses,
    tasks,
    setStatuses,
    setTasks,
    tasksRef,
    statusesRef,
  };
};
