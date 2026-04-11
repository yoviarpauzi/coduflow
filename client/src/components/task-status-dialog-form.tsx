import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskStatusForm } from "@/components/task-status-form";

type TaskStatusDialogFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "update";
  title: string;
  setTitle: (value: string) => void;
  isComplete: boolean;
  setIsComplete: (value: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export const TaskStatusDialogForm = ({
  open,
  onOpenChange,
  mode = "create",
  title,
  setTitle,
  isComplete,
  setIsComplete,
  onSubmit,
  isSubmitting,
}: TaskStatusDialogFormProps) => {
  const isUpdateMode = mode === "update";
  const dialogTitle = isUpdateMode
    ? "Update Task Status"
    : "Add New Task Status";
  const submitLabel = isUpdateMode ? "Update Task Status" : "Add Task Status";
  const submittingLabel = isUpdateMode ? "Updating..." : "Adding...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <TaskStatusForm
          title={title}
          setTitle={setTitle}
          isComplete={isComplete}
          setIsComplete={setIsComplete}
          onSubmit={onSubmit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
