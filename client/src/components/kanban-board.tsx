import { useState, useRef, useEffect } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import SortableStatus from "./sortable-status";
import TaskCard from "./task-card";
import {
  getStatuses,
  deleteStatus,
  updateStatus,
  patchStatusPosition,
} from "@/lib/api/task-status";
import { getTasks, createTask, patchTaskPosition } from "@/lib/api/task";
import type { Task } from "@/types/task";
import type { Status } from "@/types/status";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "./ui/checkbox";

type ActiveItem =
  | { type: "status"; status: Status }
  | { type: "task"; task: Task };

export function KanbanBoard() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [dragWidth, setDragWidth] = useState<number>(300);

  // Track pending status change during drag-over so we can persist it on drag-end
  const pendingStatusChange = useRef<{ taskId: string; newStatusId: string } | null>(null);

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskStatusId, setTaskStatusId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [editStatusTitle, setEditStatusTitle] = useState("");
  const [editStatusIsComplete, setEditStatusIsComplete] = useState(false);

  const queryClient = useQueryClient();
  const searchQuery = useSearch({ strict: false });
  const search = (searchQuery.search as string) ?? "";

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 2000);

    return () => clearTimeout(handler);
  }, [search]);

  const { data: fetchedStatuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: getStatuses,
  });
  const { data: fetchedTasks } = useQuery({
    queryKey: ["tasks", debouncedSearch],
    queryFn: () => getTasks(debouncedSearch),
  });

  useEffect(() => {
    if (fetchedStatuses) setStatuses(fetchedStatuses);
  }, [fetchedStatuses]);

  useEffect(() => {
    if (fetchedTasks) setTasks(fetchedTasks);
  }, [fetchedTasks]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ statusId, payload }: { statusId: string; payload: any }) =>
      updateStatus(statusId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
      setIsEditStatusDialogOpen(false);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: ({
      name,
      taskStatusId,
      position,
      description,
    }: {
      name: string;
      taskStatusId: string;
      position: number;
      description?: string;
    }) => createTask(name, taskStatusId, position, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsTaskDialogOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (statusId: string) => deleteStatus(statusId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["statuses"] }),
  });

  const updateStatusPositionMutation = useMutation({
    mutationFn: ({
      statusId,
      position,
    }: {
      statusId: string;
      position: number;
    }) => patchStatusPosition(statusId, position),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["statuses"] }),
  });

  const updateTaskPositionMutation = useMutation({
    mutationFn: ({
      taskId,
      position,
      taskStatusId,
    }: {
      taskId: string;
      position: number;
      taskStatusId: string;
    }) => patchTaskPosition(taskId, position, taskStatusId),
  });

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const statusesRef = useRef(statuses);
  statusesRef.current = statuses;

  const isStatusDragging = activeItem?.type === "status";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const getStatusIdOfItem = (id: string): string | undefined => {
    if (statusesRef.current.find((c) => c.id === id)) return id;
    if (id.startsWith("droppable-")) return id.replace("droppable-", "");
    return tasksRef.current.find((t) => t.id === id)?.taskStatusId;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    if (data?.type === "status") {
      setActiveItem({ type: "status", status: data.status });
    } else if (data?.type === "task") {
      setActiveItem({ type: "task", task: data.task });
      const initialWidth = active.rect.current.initial?.width;
      if (initialWidth) setDragWidth(initialWidth);
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || isStatusDragging) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeColId = getStatusIdOfItem(activeId);
    const overColId = getStatusIdOfItem(overId);

    if (!activeColId || !overColId || activeColId === overColId) return;

    // Record the pending status change so handleDragEnd can persist it
    pendingStatusChange.current = { taskId: activeId, newStatusId: overColId };

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, taskStatusId: overColId } : t)),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null);

    const activeId = String(active.id);
    const activeType = active.data.current?.type;

    // If a cross-column status change was detected during drag-over but drag-end
    // lands on null or the same item, we still need to persist the status change.
    if (!over || String(over.id) === activeId) {
      if (pendingStatusChange.current && activeType === "task") {
        const { taskId, newStatusId } = pendingStatusChange.current;
        pendingStatusChange.current = null;

        const prevTasks = tasksRef.current;
        const colTasks = prevTasks.filter((t) => t.taskStatusId === newStatusId);
        const newPosition =
          colTasks.length > 0
            ? colTasks[colTasks.length - 1].position + 65536
            : 65536;

        updateTaskPositionMutation.mutate({
          taskId,
          position: newPosition,
          taskStatusId: newStatusId,
        });
      }
      return;
    }

    const overId = String(over.id);

    if (activeType === "status") {
      pendingStatusChange.current = null;
      setStatuses((prev) => {
        const oldIdx = prev.findIndex((c) => c.id === activeId);
        const newIdx = prev.findIndex((c) => c.id === overId);
        if (oldIdx === -1 || newIdx === -1) return prev;

        const newCols = arrayMove(prev, oldIdx, newIdx);

        let newPosition = 0;
        if (newIdx === 0) {
          newPosition = newCols[1] ? newCols[1].position / 2 : 65536;
        } else if (newIdx === newCols.length - 1) {
          newPosition = newCols[newIdx - 1].position + 65536;
        } else {
          newPosition =
            (newCols[newIdx - 1].position + newCols[newIdx + 1].position) / 2;
        }
        newCols[newIdx].position = newPosition;

        updateStatusPositionMutation.mutate({
          statusId: activeId,
          position: newPosition,
        });

        return newCols;
      });
      return;
    }

    // Task drop
    const overColId = getStatusIdOfItem(overId);
    if (!overColId) {
      pendingStatusChange.current = null;
      return;
    }
    pendingStatusChange.current = null;

    const prevTasks = tasksRef.current;

    // Ensure the task has the new statusId locally
    const updatedTasks = prevTasks.map((t) =>
      t.id === activeId ? { ...t, taskStatusId: overColId } : t,
    );

    const colTasks = updatedTasks.filter((t) => t.taskStatusId === overColId);
    const otherTasks = updatedTasks.filter((t) => t.taskStatusId !== overColId);

    const oldIdx = colTasks.findIndex((t) => t.id === activeId);
    let newIdx = colTasks.findIndex((t) => t.id === overId);

    if (newIdx === -1) {
      newIdx = colTasks.length - 1; // Dropped on empty space in status, move to end
    }

    let finalColTasks = colTasks;
    if (oldIdx !== -1 && newIdx !== -1) {
      finalColTasks = arrayMove(colTasks, oldIdx, newIdx);
    }

    setTasks([...otherTasks, ...finalColTasks]);

    let newPosition = 0;
    if (newIdx === 0) {
      newPosition = finalColTasks[1] ? finalColTasks[1].position / 2 : 65536;
    } else if (newIdx === finalColTasks.length - 1) {
      newPosition = finalColTasks[newIdx - 1].position + 65536;
    } else {
      newPosition =
        (finalColTasks[newIdx - 1].position +
          finalColTasks[newIdx + 1].position) /
        2;
    }
    finalColTasks[newIdx].position = newPosition;

    updateTaskPositionMutation.mutate({
      taskId: activeId,
      position: newPosition,
      taskStatusId: overColId,
    });
  };

  const openAddTask = (statusId: string) => {
    setTaskStatusId(statusId);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteStatus = (statusId: string) => {
    if (
      confirm("Are you sure you want to delete this status and all its tasks?")
    ) {
      deleteStatusMutation.mutate(statusId);
    }
  };

  const submitTask = () => {
    if (newTaskTitle.trim() && taskStatusId) {
      const colTasks = tasks.filter((t) => t.taskStatusId === taskStatusId);
      let insertPos = 65536;
      if (colTasks.length > 0) {
        insertPos = colTasks[colTasks.length - 1].position + 65536;
      }
      createTaskMutation.mutate({
        name: newTaskTitle,
        taskStatusId: taskStatusId,
        position: insertPos,
        description: newTaskDesc,
      });
    }
  };

  const openEditStatus = (status: Status) => {
    setEditingStatus(status);
    setEditStatusTitle(status.title);
    setEditStatusIsComplete(status.isComplete || false);
    setIsEditStatusDialogOpen(true);
  };

  const handleEditStatusSubmit = () => {
    if (editingStatus && editStatusTitle.trim()) {
      updateStatusMutation.mutate({
        statusId: editingStatus.id,
        payload: {
          title: editStatusTitle,
          isComplete: editStatusIsComplete,
        },
      });
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={statuses.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-col gap-6 md:flex-row md:overflow-x-auto pb-4 board-scroll">
            {statuses.map((col) => (
              <SortableStatus
                key={col.id}
                status={col}
                tasks={tasks.filter((t) => t.taskStatusId === col.id)}
                isStatusDragging={isStatusDragging}
                onMeasureTaskWidth={setDragWidth}
                onAddTask={openAddTask}
                onDeleteStatus={handleDeleteStatus}
                onEditStatus={openEditStatus}
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
                  statuses.find((s) => s.id === activeItem.task.taskStatusId)
                    ?.isComplete
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

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Update user settings logic"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-desc">Description (Optional)</Label>
              <Input
                id="task-desc"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Add some details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTaskDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitTask}
              disabled={createTaskMutation.isPending || !newTaskTitle}
            >
              {createTaskMutation.isPending ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditStatusDialogOpen}
        onOpenChange={setIsEditStatusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-col-title">Status Title</Label>
              <Input
                id="edit-col-title"
                value={editStatusTitle}
                onChange={(e) => setEditStatusTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="edit-col-iscomplete"
                checked={editStatusIsComplete}
                onCheckedChange={(checked: boolean) =>
                  setEditStatusIsComplete(checked === true)
                }
              />
              <Label htmlFor="edit-col-iscomplete" className="cursor-pointer">
                Mark tasks in this status as Done
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStatusSubmit}
              disabled={updateStatusMutation.isPending || !editStatusTitle}
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
