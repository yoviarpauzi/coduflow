import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableColumn from "./sortable-column";
import TaskCard from "./task-card";
import type { Task } from "@/types/task";

interface Column {
  id: string;
  title: string;
}

type ActiveItem =
  | { type: "column"; column: Column }
  | { type: "task"; task: Task };

const INITIAL_COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
  { id: "review", title: "Review" },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Integrate Stripe payment gateway",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "None",
    progress: 10,
    members: [
      { id: "a", name: "Alice", avatar: "https://i.pravatar.cc/32?img=1" },
      { id: "b", name: "Bob", avatar: "https://i.pravatar.cc/32?img=2" },
    ],
    attachments: 2,
    comments: 4,
    columnId: "backlog",
  },
  {
    id: "101",
    title: "Integrate Stripe payment gateway",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "High",
    progress: 10,
    members: [
      { id: "a", name: "Alice", avatar: "https://i.pravatar.cc/32?img=1" },
      { id: "b", name: "Bob", avatar: "https://i.pravatar.cc/32?img=2" },
    ],
    attachments: 2,
    comments: 4,
    columnId: "backlog",
  },
  {
    id: "102",
    title: "Integrate Stripe payment gateway",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "High",
    progress: 10,
    members: [
      { id: "a", name: "Alice", avatar: "https://i.pravatar.cc/32?img=1" },
      { id: "b", name: "Bob", avatar: "https://i.pravatar.cc/32?img=2" },
    ],
    attachments: 2,
    comments: 4,
    columnId: "backlog",
  },
  {
    id: "103",
    title: "Integrate Stripe payment gateway",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "High",
    progress: 10,
    members: [
      { id: "a", name: "Alice", avatar: "https://i.pravatar.cc/32?img=1" },
      { id: "b", name: "Bob", avatar: "https://i.pravatar.cc/32?img=2" },
    ],
    attachments: 2,
    comments: 4,
    columnId: "backlog",
  },
  {
    id: "2",
    title: "Redesign marketing homepage",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "Medium",
    progress: 0,
    members: [
      { id: "c", name: "Carol", avatar: "https://i.pravatar.cc/32?img=3" },
      { id: "d", name: "Dave", avatar: "https://i.pravatar.cc/32?img=4" },
    ],
    attachments: 1,
    comments: 1,
    columnId: "backlog",
  },
  {
    id: "3",
    title: "Set up automated backups",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "Low",
    progress: 5,
    members: [
      { id: "e", name: "Eve", avatar: "https://i.pravatar.cc/32?img=5" },
      { id: "f", name: "Frank", avatar: "https://i.pravatar.cc/32?img=6" },
    ],
    attachments: 0,
    comments: 3,
    columnId: "backlog",
  },
  {
    id: "4",
    title: "Dark mode toggle implementation",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "High",
    progress: 40,
    members: [
      { id: "g", name: "Grace", avatar: "https://i.pravatar.cc/32?img=7" },
      { id: "h", name: "Hank", avatar: "https://i.pravatar.cc/32?img=8" },
    ],
    attachments: 2,
    comments: 6,
    columnId: "in-progress",
  },
  {
    id: "5",
    title: "Database schema refactoring",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "Medium",
    progress: 55,
    members: [
      { id: "i", name: "Ivy", avatar: "https://i.pravatar.cc/32?img=9" },
      { id: "j", name: "Jack", avatar: "https://i.pravatar.cc/32?img=10" },
      { id: "k", name: "Jack", avatar: "https://i.pravatar.cc/32?img=10" },
      { id: "l", name: "Jack", avatar: "https://i.pravatar.cc/32?img=10" },
    ],
    attachments: 3,
    comments: 2,
    columnId: "in-progress",
  },
  {
    id: "6",
    title: "Accessibility improvements",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "Low",
    progress: 35,
    members: [
      { id: "k", name: "Kate", avatar: "https://i.pravatar.cc/32?img=11" },
      { id: "l", name: "Liam", avatar: "https://i.pravatar.cc/32?img=12" },
    ],
    attachments: 1,
    comments: 1,
    columnId: "in-progress",
  },
  {
    id: "7",
    title: "Set up CI/CD pipeline",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "High",
    progress: 100,
    members: [
      { id: "m", name: "Mia", avatar: "https://i.pravatar.cc/32?img=13" },
      { id: "n", name: "Noah", avatar: "https://i.pravatar.cc/32?img=14" },
    ],
    attachments: 2,
    comments: 4,
    columnId: "done",
  },
  {
    id: "8",
    title: "Initial project setup",
    description: "Compile competitor landing page designs for inspiration. G..",
    priority: "Medium",
    progress: 100,
    members: [
      { id: "o", name: "Olivia", avatar: "https://i.pravatar.cc/32?img=15" },
      { id: "p", name: "Pete", avatar: "https://i.pravatar.cc/32?img=16" },
    ],
    attachments: 1,
    comments: 2,
    columnId: "done",
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [dragWidth, setDragWidth] = useState<number>(300);

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const isColumnDragging = activeItem?.type === "column";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const getColumnIdOfItem = (id: string): string | undefined => {
    if (columnsRef.current.find((c) => c.id === id)) return id;
    if (id.startsWith("droppable-")) return id.replace("droppable-", "");
    return tasksRef.current.find((t) => t.id === id)?.columnId;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    if (data?.type === "column") {
      setActiveItem({ type: "column", column: data.column });
    } else if (data?.type === "task") {
      setActiveItem({ type: "task", task: data.task });
      const initialWidth = active.rect.current.initial?.width;
      if (initialWidth) setDragWidth(initialWidth);
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || isColumnDragging) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeColId = getColumnIdOfItem(activeId);
    const overColId = getColumnIdOfItem(overId);

    if (!activeColId || !overColId || activeColId === overColId) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, columnId: overColId } : t)),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeType = active.data.current?.type;

    if (activeType === "column") {
      setColumns((prev) => {
        const oldIdx = prev.findIndex((c) => c.id === activeId);
        const newIdx = prev.findIndex((c) => c.id === overId);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
      return;
    }

    const activeColId = getColumnIdOfItem(activeId);
    const overColId = getColumnIdOfItem(overId);
    if (!activeColId || !overColId || activeColId !== overColId) return;

    setTasks((prev) => {
      const colTasks = prev.filter((t) => t.columnId === activeColId);
      const otherTasks = prev.filter((t) => t.columnId !== activeColId);
      const oldIdx = colTasks.findIndex((t) => t.id === activeId);
      const newIdx = colTasks.findIndex((t) => t.id === overId);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return [...otherTasks, ...arrayMove(colTasks, oldIdx, newIdx)];
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-col gap-6 md:flex-row md:overflow-x-auto pb-4 board-scroll">
          {columns.map((col) => (
            <SortableColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.columnId === col.id)}
              isColumnDragging={isColumnDragging}
              onMeasureTaskWidth={setDragWidth}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem?.type === "task" && (
          <div
            className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-2xl rotate-1 opacity-95"
            style={{ width: dragWidth }}
          >
            <TaskCard task={activeItem.task} />
          </div>
        )}
        {activeItem?.type === "column" && (
          <div className="flex flex-col gap-3 min-w-75 opacity-90 shadow-2xl">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {activeItem.column.title}
                </span>
              </div>
            </div>
            <div className="rounded-xl border bg-muted/30 min-h-25 p-2" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
