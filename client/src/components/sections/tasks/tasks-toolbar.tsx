import { CirclePlus } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { TaskStatusDialogForm } from "@/components/task-status-dialog-form";
import type { CreateTaskStatusDialogModel } from "@/types/task-ui-models";

type TasksToolbarProps = {
  taskStatusDialog: CreateTaskStatusDialogModel;
};

export const TasksToolbar = ({
  taskStatusDialog,
}: TasksToolbarProps) => {
  return (
    <div className="flex gap-x-2">
      <SearchInput placeholder="Search Tasks" />
      <Button
        className="cursor-pointer flex items-center gap-2"
        onClick={taskStatusDialog.onOpenCreate}
      >
        <CirclePlus className="h-4 w-4" />
        <span className="hidden lg:inline">Add Task Status</span>
      </Button>
      <TaskStatusDialogForm
        open={taskStatusDialog.open}
        onOpenChange={taskStatusDialog.onOpenChange}
        mode={taskStatusDialog.mode}
        title={taskStatusDialog.title}
        setTitle={taskStatusDialog.setTitle}
        isComplete={taskStatusDialog.isComplete}
        setIsComplete={taskStatusDialog.setIsComplete}
        onSubmit={taskStatusDialog.onSubmit}
        isSubmitting={taskStatusDialog.isSubmitting}
      />
    </div>
  );
};
