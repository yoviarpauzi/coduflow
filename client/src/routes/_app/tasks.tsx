import { SearchInput } from "@/components/search-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";

export const Route = createFileRoute("/_app/tasks")({
  component: RouteComponent,
  validateSearch: (query: Record<string, unknown>): { search?: string } => {
    return {
      search: query.search as string | undefined,
    };
  },
});

function RouteComponent() {
  return (
    <main>
      <h1 className="text-2xl font-bold">Tasks</h1>
      <Tabs defaultValue="board" className="mt-4">
        <div className="flex justify-between items-center">
          <TabsList className="space-x-2">
            <TabsTrigger value="board" className="cursor-pointer">
              Board
            </TabsTrigger>
            <TabsTrigger value="list" className="cursor-pointer">
              List
            </TabsTrigger>
            <TabsTrigger value="table" className="cursor-pointer">
              Table
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-x-2">
            <SearchInput placeholder="Search Tasks" />
            <Button className="cursor-pointer flex items-center gap-2">
              <CirclePlus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Board</span>
            </Button>
          </div>
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
