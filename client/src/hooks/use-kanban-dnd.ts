import { useTaskKanbanDnd } from "@/hooks/use-task-kanban-dnd";

type UseKanbanDndParams = Parameters<typeof useTaskKanbanDnd>[0];

export const useKanbanDnD = (params: UseKanbanDndParams) => {
  return useTaskKanbanDnd(params);
};
