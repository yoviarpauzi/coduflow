import type { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DroppableColumnBody from "./droppable-column-body";
import SortableTaskCard from "./sortable-taskcard";
import { GripVertical, Plus } from "lucide-react";

interface Column {
  id: string;
  title: string;
}

const SortableColumn = ({
  column,
  tasks,
  isColumnDragging,
  onMeasureTaskWidth,
}: {
  column: Column;
  tasks: Task[];
  isColumnDragging: boolean;
  onMeasureTaskWidth: (width: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-3 w-full md:w-96 md:shrink-0 ${isDragging ? "opacity-30" : ""}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{column.title}</span>
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
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        disabled={isColumnDragging}
      >
        <DroppableColumnBody columnId={column.id}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onMeasureWidth={onMeasureTaskWidth}
            />
          ))}
        </DroppableColumnBody>
      </SortableContext>
    </div>
  );
};

export default SortableColumn;
