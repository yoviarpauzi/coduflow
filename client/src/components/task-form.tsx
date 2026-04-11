import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskFormProps = {
  id: string;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  onSubmit: () => void;
};

export const TaskForm = ({
  id,
  title,
  setTitle,
  description,
  setDescription,
  onSubmit,
}: TaskFormProps) => {
  return (
    <form
      id={id}
      className="grid gap-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="task-title">Task Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Update user settings logic"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="task-desc">Description (Optional)</Label>
        <Input
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add some details..."
        />
      </div>
    </form>
  );
};
