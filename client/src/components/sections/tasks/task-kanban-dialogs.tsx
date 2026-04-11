import { TaskDialogForm } from "@/components/task-dialog-form";
import { TaskStatusDialogForm } from "@/components/task-status-dialog-form";
import type {
  TaskDialogModel,
  TaskStatusDialogModel,
} from "@/types/task-ui-models";

type TaskKanbanDialogsProps = {
  taskDialog: TaskDialogModel;
  taskStatusDialog: TaskStatusDialogModel;
};

export const TaskKanbanDialogs = ({
  taskDialog,
  taskStatusDialog,
}: TaskKanbanDialogsProps) => {
  return (
    <>
      <TaskDialogForm {...taskDialog} />
      <TaskStatusDialogForm {...taskStatusDialog} />
    </>
  );
};
