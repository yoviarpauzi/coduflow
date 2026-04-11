import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/kanban-board";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTaskStatus } from "@/lib/api/task-status";
import { useTaskStatusMutation } from "@/hooks/use-task-status-mutation";
import { TasksToolbar } from "@/components/tasks-toolbar";

const TASK_VIEW_TABS = [
  { value: "board", label: "Board" },
  { value: "list", label: "List" },
  { value: "table", label: "Table" },
] as const;

export const Route = createFileRoute("/_app/tasks")({
  component: RouteComponent,
  validateSearch: (query: Record<string, unknown>): { search?: string } => {
    return {
      search: query.search as string | undefined,
    };
  },
});

function RouteComponent() {
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] = useState(false);
  const [taskStatusTitle, setTaskStatusTitle] = useState("");
  const [taskStatusIsComplete, setTaskStatusIsComplete] = useState(false);
  const { createStatus, isCreating } = useTaskStatusMutation();

  const { data: taskStatuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: getTaskStatus,
  });

  const resetTaskStatusDialogState = () => {
    setTaskStatusTitle("");
    setTaskStatusIsComplete(false);
  };

  const handleTaskStatusDialogOpenChange = (open: boolean) => {
    setIsTaskStatusDialogOpen(open);
    if (!open) {
      resetTaskStatusDialogState();
    }
  };

  const openCreateTaskStatusDialog = () => {
    resetTaskStatusDialogState();
    handleTaskStatusDialogOpenChange(true);
  };

  const submitTaskStatus = () => {
    const trimmedTitle = taskStatusTitle.trim();
    if (!trimmedTitle) return;
    createStatus(
      {
        title: trimmedTitle,
        position: (taskStatuses?.length || 0) + 1,
        isComplete: taskStatusIsComplete,
      },
      {
        onSuccess: () => {
          handleTaskStatusDialogOpenChange(false);
        },
      },
    );
  };

  return (
    <main>
      <h1 className="text-2xl font-bold">Tasks</h1>

      <Tabs defaultValue="board" className="mt-4">
        <div className="flex justify-between items-center">
          <TabsList className="space-x-2">
            {TASK_VIEW_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TasksToolbar
            isTaskStatusDialogOpen={isTaskStatusDialogOpen}
            onTaskStatusDialogOpenChange={handleTaskStatusDialogOpenChange}
            onOpenCreateTaskStatusDialog={openCreateTaskStatusDialog}
            taskStatusTitle={taskStatusTitle}
            setTaskStatusTitle={setTaskStatusTitle}
            taskStatusIsComplete={taskStatusIsComplete}
            setTaskStatusIsComplete={setTaskStatusIsComplete}
            onSubmitTaskStatus={submitTaskStatus}
            isCreatingTaskStatus={isCreating}
          />
        </div>

        <div className="mt-4">
          <TabsContent value="board">
            <KanbanBoard />
          </TabsContent>

          <TabsContent value="list">
            <div>List View</div>
          </TabsContent>

          <TabsContent value="table">
            <div>Table View</div>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
