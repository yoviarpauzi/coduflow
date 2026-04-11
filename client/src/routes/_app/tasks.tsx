import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { TaskKanbanBoard } from "@/components/sections/tasks/task-kanban-board";
import { TasksToolbar } from "@/components/sections/tasks/tasks-toolbar";
import { useCreateTaskStatusDialog } from "@/hooks/use-create-task-status-dialog";
import type { ReactNode } from "react";

const TASK_VIEW_TABS = [
  { value: "board", label: "Board", content: <TaskKanbanBoard /> },
  { value: "list", label: "List", content: <div>List View</div> },
  { value: "table", label: "Table", content: <div>Table View</div> },
] as const;

type TaskViewTab = {
  value: (typeof TASK_VIEW_TABS)[number]["value"];
  label: string;
  content: ReactNode;
};

export const Route = createFileRoute("/_app/tasks")({
  component: RouteComponent,
  validateSearch: (query: Record<string, unknown>): { search?: string } => {
    return {
      search: query.search as string | undefined,
    };
  },
});

function RouteComponent() {
  const vm = useCreateTaskStatusDialog();

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
          <TasksToolbar taskStatusDialog={vm.taskStatusDialog} />
        </div>

        <div className="mt-4">
          {(TASK_VIEW_TABS as readonly TaskViewTab[]).map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </main>
  );
}
