import type { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DroppableStatusBody from "./droppable-status-body";
import SortableTaskCard from "./sortable-taskcard";
import { GripVertical, Plus, Trash2, Pencil } from "lucide-react";

import type { Status } from "@/types/status";

const SortableStatus = ({
  status,
  tasks,
  isStatusDragging,
  onMeasureTaskWidth,
  onAddTask,
  onDeleteStatus,
  onEditStatus,
}: {
  status: Status;
  tasks: Task[];
  isStatusDragging: boolean;
  onMeasureTaskWidth: (width: number) => void;
  onAddTask: (statusId: string) => void;
  onDeleteStatus: (statusId: string) => void;
  onEditStatus: (status: Status) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: status.id,
    data: { type: "status", status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-3 w-full md:w-96 md:shrink-0 ${isDragging ? "opacity-30" : ""}`}
    >
      {/* Status header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{status.title}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
          {onEditStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => onEditStatus(status)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDeleteStatus(status.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => onAddTask(status.id)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        disabled={isStatusDragging}
      >
        <DroppableStatusBody statusId={status.id}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              isStatusComplete={status.isComplete}
              onMeasureWidth={onMeasureTaskWidth}
            />
          ))}
        </DroppableStatusBody>
      </SortableContext>
    </div>
  );
};

export default SortableStatus;
