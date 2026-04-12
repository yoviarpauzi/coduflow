import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { useMemo } from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableStatus } from "@/components/sortable-status";
import { TaskCard } from "@/components/task-card";
import type { TaskKanbanDndModel } from "@/types/task-ui-models";

export const TaskKanbanDndBoard = ({
  statuses,
  tasks,
  activeItem,
  dragWidth,
  setDragWidth,
  isStatusDragging,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  onAddTask,
  onDeleteTaskStatus,
  onEditTaskStatus,
}: TaskKanbanDndModel) => {
  const tasksByStatusId = useMemo(() => {
    return tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
      if (!acc[task.taskStatusId]) {
        acc[task.taskStatusId] = [];
      }
      acc[task.taskStatusId].push(task);
      return acc;
    }, {});
  }, [tasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={statuses.map((status) => status.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-col gap-6 md:flex-row md:overflow-x-auto pb-4 board-scroll">
          {statuses.map((status) => (
            <SortableStatus
              key={status.id}
              status={status}
              tasks={tasksByStatusId[status.id] || []}
              isStatusDragging={isStatusDragging}
              onMeasureTaskWidth={setDragWidth}
              onAddTask={onAddTask}
              onDeleteTaskStatus={onDeleteTaskStatus}
              onEditTaskStatus={onEditTaskStatus}
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
            <TaskCard
              task={activeItem.task}
              isStatusComplete={
                statuses.find(
                  (status) => status.id === activeItem.task.taskStatusId,
                )?.isComplete
              }
            />
          </div>
        )}
        {activeItem?.type === "status" && (
          <div className="flex flex-col gap-3 min-w-75 opacity-90 shadow-2xl">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {activeItem.status.title}
                </span>
              </div>
            </div>
            <div className="rounded-xl border bg-muted/30 min-h-25 p-2" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
