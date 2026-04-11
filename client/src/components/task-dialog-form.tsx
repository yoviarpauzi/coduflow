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
  title,
  setTitle,
  description,
  setDescription,
  onSubmit,
  isSubmitting,
  disableSubmit = false,
}: TaskDialogFormProps) => {
  const formId = "task-dialog-form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
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
            {isSubmitting ? "Adding..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
