import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TaskCard } from "./task-card";
import type { Task } from "@/types/task";
import { useRef } from "react";

const SortableTaskCard = ({
  task,
  isStatusComplete,
  onMeasureWidth,
}: {
  task: Task;
  isStatusComplete?: boolean;
  onMeasureWidth: (width: number) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={setRefs}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border bg-card p-4 flex flex-col gap-3 group relative
        ${isDragging ? "opacity-30" : "shadow-sm hover:shadow-md"}`}
    >
      <button
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          if (cardRef.current) {
            onMeasureWidth(cardRef.current.getBoundingClientRect().width);
          }
          listeners?.onPointerDown?.(e);
        }}
        className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:opacity-100! transition-opacity cursor-grab active:cursor-grabbing p-1 z-10"
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </button>

      <TaskCard task={task} isStatusComplete={isStatusComplete} />
    </div>
  );
};

export default SortableTaskCard;
