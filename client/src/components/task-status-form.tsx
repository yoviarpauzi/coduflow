import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Field } from "./ui/field";
import { Checkbox } from "./ui/checkbox";

type TaskStatusFormProps = {
  title: string;
  setTitle: (value: string) => void;
  isComplete: boolean;
  setIsComplete: (value: boolean) => void;
  onSubmit: () => void;
};

export const TaskStatusForm = ({
  title,
  setTitle,
  isComplete,
  setIsComplete,
  onSubmit,
}: TaskStatusFormProps) => {
  return (
    <form
      className="grid gap-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="board-title">Name</Label>
        <Input
          id="board-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. In Review"
          autoFocus
        />
      </div>

      <Field orientation="horizontal" className="flex items-center gap-2 mt-2">
        <Checkbox
          id="board-complete"
          checked={isComplete}
          onCheckedChange={(checked) => setIsComplete(checked === true)}
        />
        <Label htmlFor="board-complete" className="cursor-pointer">
          Mark as 'Done' status
        </Label>
      </Field>
    </form>
  );
};
