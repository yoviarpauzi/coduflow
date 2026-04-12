import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";

type TaskDialogFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "update";
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  disableSubmit?: boolean;
};

export const TaskDialogForm = ({
  open,
  onOpenChange,
  mode = "create",
  title,
  setTitle,
  description,
  setDescription,
  onSubmit,
  isSubmitting,
  disableSubmit = false,
}: TaskDialogFormProps) => {
  const isUpdateMode = mode === "update";
  const formId = "task-dialog-form";
  const dialogTitle = isUpdateMode ? "Update Task" : "Add New Task";
  const submitLabel = isUpdateMode ? "Update Task" : "Add Task";
  const submittingLabel = isUpdateMode ? "Updating..." : "Adding...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <TaskForm
          id={formId}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          onSubmit={onSubmit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || disableSubmit}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
