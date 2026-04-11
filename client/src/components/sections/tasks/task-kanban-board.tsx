import { TaskKanbanDndBoard } from "@/components/sections/tasks/task-kanban-dnd-board";
import { TaskKanbanDialogs } from "@/components/sections/tasks/task-kanban-dialogs";
import { useTaskKanbanBoard } from "@/hooks/use-task-kanban-board";

export function TaskKanbanBoard() {
  const vm = useTaskKanbanBoard();

  return (
    <>
      <TaskKanbanDndBoard {...vm.dnd} />
      <TaskKanbanDialogs
        taskDialog={vm.taskDialog}
        taskStatusDialog={vm.taskStatusDialog}
      />
    </>
  );
}
