import { TaskKanbanDndBoard } from "@/components/sections/tasks/task-kanban-dnd-board";
import { TaskKanbanDialogs } from "@/components/sections/tasks/task-kanban-dialogs";
import { useTaskKanbanBoard } from "@/hooks/use-task-kanban-board";

export function TaskKanbanBoard() {
  const { dnd, taskDialog, taskStatusDialog } = useTaskKanbanBoard();

  return (
    <>
      <TaskKanbanDndBoard {...dnd} />
      <TaskKanbanDialogs
        taskDialog={taskDialog}
        taskStatusDialog={taskStatusDialog}
      />
    </>
  );
}
