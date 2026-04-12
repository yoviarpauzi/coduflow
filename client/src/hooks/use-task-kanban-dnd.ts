import {
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { getPositionAtIndex } from "@/lib/kanban-position";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/types/task-status";
import type { ActiveItem, TaskKanbanDndModel } from "@/types/task-ui-models";

type UpdateTaskPositionFn = (payload: {
  id: string;
  position: number;
  taskStatusId: string;
}) => void;

type UpdateTaskStatusPositionFn = (payload: {
  id: string;
  position: number;
}) => void;

type UseKanbanDndParams = {
  statuses: TaskStatus[];
  tasks: Task[];
  setStatuses: Dispatch<SetStateAction<TaskStatus[]>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  tasksRef: MutableRefObject<Task[]>;
  statusesRef: MutableRefObject<TaskStatus[]>;
  onAddTask: (statusId: string) => void;
  onDeleteTaskStatus: (statusId: string) => void;
  onEditTaskStatus: (taskStatus: TaskStatus) => void;
  updateTaskPosition: UpdateTaskPositionFn;
  updateTaskStatusPosition: UpdateTaskStatusPositionFn;
};

export const useTaskKanbanDnd = ({
  statuses,
  tasks,
  setStatuses,
  setTasks,
  tasksRef,
  statusesRef,
  onAddTask,
  onDeleteTaskStatus,
  onEditTaskStatus,
  updateTaskPosition,
  updateTaskStatusPosition,
}: UseKanbanDndParams): TaskKanbanDndModel => {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [dragWidth, setDragWidth] = useState(300);
  const pendingStatusChange = useRef<{
    taskId: string;
    newStatusId: string;
  } | null>(null);

  const isStatusDragging = activeItem?.type === "status";
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const getStatusIdOfItem = (id: string): string | undefined => {
    if (statusesRef.current.find((status) => status.id === id)) return id;
    if (id.startsWith("droppable-")) return id.replace("droppable-", "");
    return tasksRef.current.find((task) => task.id === id)?.taskStatusId;
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    if (data?.type === "status") {
      setActiveItem({ type: "status", status: data.status });
    } else if (data?.type === "task") {
      setActiveItem({ type: "task", task: data.task });
      const initialWidth = active.rect.current.initial?.width;
      if (initialWidth) setDragWidth(initialWidth);
    }
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || isStatusDragging) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeStatusId = getStatusIdOfItem(activeId);
    const overStatusId = getStatusIdOfItem(overId);
    if (!activeStatusId || !overStatusId || activeStatusId === overStatusId) {
      return;
    }

    pendingStatusChange.current = { taskId: activeId, newStatusId: overStatusId };

    setTasks((prev) =>
      prev.map((task) =>
        task.id === activeId ? { ...task, taskStatusId: overStatusId } : task,
      ),
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null);

    const activeId = String(active.id);
    const activeType = active.data.current?.type;

    if (!over) {
      pendingStatusChange.current = null;
      return;
    }

    const hasStatusChange = Boolean(pendingStatusChange.current);
    const isSameTarget = String(over.id) === activeId;
    if (isSameTarget && !hasStatusChange) {
      pendingStatusChange.current = null;
      return;
    }

    const overId = String(over.id);

    if (activeType === "status") {
      pendingStatusChange.current = null;
      setStatuses((prev) => {
        const oldIdx = prev.findIndex((status) => status.id === activeId);
        const newIdx = prev.findIndex((status) => status.id === overId);
        if (oldIdx === -1 || newIdx === -1) return prev;

        const reorderedStatuses = arrayMove(prev, oldIdx, newIdx).map((status) => ({
          ...status,
        }));
        const newPosition = getPositionAtIndex(reorderedStatuses, newIdx);
        reorderedStatuses[newIdx] = {
          ...reorderedStatuses[newIdx],
          position: newPosition,
        };
        updateTaskStatusPosition({ id: activeId, position: newPosition });
        return reorderedStatuses;
      });
      return;
    }

    const overStatusId = getStatusIdOfItem(overId);
    if (!overStatusId) {
      pendingStatusChange.current = null;
      return;
    }
    pendingStatusChange.current = null;

    const updatedTasks = tasksRef.current.map((task) =>
      task.id === activeId ? { ...task, taskStatusId: overStatusId } : task,
    );

    const statusTasks = updatedTasks.filter(
      (task) => task.taskStatusId === overStatusId,
    );
    const otherTasks = updatedTasks.filter(
      (task) => task.taskStatusId !== overStatusId,
    );

    const oldIdx = statusTasks.findIndex((task) => task.id === activeId);
    let newIdx = statusTasks.findIndex((task) => task.id === overId);
    if (newIdx === -1) {
      newIdx = statusTasks.length - 1;
    }

    let finalStatusTasks = statusTasks;
    if (oldIdx !== -1 && newIdx !== -1) {
      finalStatusTasks = arrayMove(statusTasks, oldIdx, newIdx);
    }

    const newPosition = getPositionAtIndex(finalStatusTasks, newIdx);
    const nextStatusTasks = finalStatusTasks.map((task, idx) =>
      idx === newIdx ? { ...task, position: newPosition } : task,
    );
    setTasks([...otherTasks, ...nextStatusTasks]);
    updateTaskPosition({
      id: activeId,
      position: newPosition,
      taskStatusId: overStatusId,
    });
  };

  return {
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
  };
};
