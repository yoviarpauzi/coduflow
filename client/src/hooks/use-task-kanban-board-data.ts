import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { getTaskStatus } from "@/lib/api/task-status";
import { getTasks } from "@/lib/api/task";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/types/task-status";

export const useTaskKanbanBoardData = () => {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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
    queryKey: ["statuses"],
    queryFn: getTaskStatus,
  });
  const { data: fetchedTasks } = useQuery({
    queryKey: ["tasks", debouncedSearch],
    queryFn: () => getTasks({ search: debouncedSearch }),
  });

  useEffect(() => {
    if (fetchedStatuses) setStatuses(fetchedStatuses);
  }, [fetchedStatuses]);

  useEffect(() => {
    if (fetchedTasks) setTasks(fetchedTasks);
  }, [fetchedTasks]);

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
