import { useKanbanData } from "@/hooks/use-kanban-data";
import { useKanbanDnD } from "@/hooks/use-kanban-dnd";
import { useKanbanMutations } from "@/hooks/use-kanban-mutations";
import { useKanbanUI } from "@/hooks/use-kanban-ui";

export const useTaskKanbanBoard = () => {
  const data = useKanbanData();
  const mutations = useKanbanMutations();
  const ui = useKanbanUI({
    tasks: data.tasks,
    createTask: mutations.createTask,
    updateTaskStatus: mutations.updateTaskStatus,
    deleteTaskStatus: mutations.deleteTaskStatus,
    isCreatingTask: mutations.isCreatingTask,
    isUpdatingTaskPosition: mutations.isUpdatingTaskPosition,
    isUpdatingTaskStatus: mutations.isUpdatingTaskStatus,
  });

  const dnd = useKanbanDnD({
    statuses: data.statuses,
    tasks: data.tasks,
    setStatuses: data.setStatuses,
    setTasks: data.setTasks,
    tasksRef: data.tasksRef,
    statusesRef: data.statusesRef,
    onAddTask: ui.onAddTask,
    onDeleteTaskStatus: ui.onDeleteTaskStatus,
    onEditTaskStatus: ui.onEditTaskStatus,
    updateTaskPosition: mutations.updateTaskPosition,
    updateTaskStatusPosition: mutations.updateTaskStatusPosition,
  });

  return {
    dnd,
    taskDialog: ui.taskDialog,
    taskStatusDialog: ui.taskStatusDialog,
  };
};
