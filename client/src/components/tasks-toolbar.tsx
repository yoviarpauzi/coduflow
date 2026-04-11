import { CirclePlus } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { TaskStatusDialogForm } from "@/components/task-status-dialog-form";

type TasksToolbarProps = {
  isTaskStatusDialogOpen: boolean;
  onTaskStatusDialogOpenChange: (open: boolean) => void;
  onOpenCreateTaskStatusDialog: () => void;
  taskStatusTitle: string;
  setTaskStatusTitle: (value: string) => void;
  taskStatusIsComplete: boolean;
  setTaskStatusIsComplete: (value: boolean) => void;
  onSubmitTaskStatus: () => void;
  isCreatingTaskStatus: boolean;
};

export const TasksToolbar = ({
  isTaskStatusDialogOpen,
  onTaskStatusDialogOpenChange,
  onOpenCreateTaskStatusDialog,
  taskStatusTitle,
  setTaskStatusTitle,
  taskStatusIsComplete,
  setTaskStatusIsComplete,
  onSubmitTaskStatus,
  isCreatingTaskStatus,
}: TasksToolbarProps) => {
  return (
    <div className="flex gap-x-2">
      <SearchInput placeholder="Search Tasks" />
      <Button
        className="cursor-pointer flex items-center gap-2"
        onClick={onOpenCreateTaskStatusDialog}
      >
        <CirclePlus className="h-4 w-4" />
        <span className="hidden lg:inline">Add Task Status</span>
      </Button>
      <TaskStatusDialogForm
        open={isTaskStatusDialogOpen}
        onOpenChange={onTaskStatusDialogOpenChange}
        mode="create"
        title={taskStatusTitle}
        setTitle={setTaskStatusTitle}
        isComplete={taskStatusIsComplete}
        setIsComplete={setTaskStatusIsComplete}
        onSubmit={onSubmitTaskStatus}
        isSubmitting={isCreatingTaskStatus}
      />
    </div>
  );
};
