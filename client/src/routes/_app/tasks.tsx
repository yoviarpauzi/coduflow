import { SearchInput } from "@/components/search-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createStatus, getStatuses } from "@/lib/api/task-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";

export const Route = createFileRoute("/_app/tasks")({
  component: RouteComponent,
  validateSearch: (query: Record<string, unknown>): { search?: string } => {
    return {
      search: query.search as string | undefined,
    };
  },
});

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [isStatusComplete, setIsStatusComplete] = useState(false);
  const queryClient = useQueryClient();

  const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: getStatuses,
  });

  const createStatusMutation = useMutation({
    mutationFn: ({
      title,
      position,
      isComplete,
    }: {
      title: string;
      position: number;
      isComplete: boolean;
    }) => createStatus(title, position, isComplete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
      setIsDialogOpen(false);
      setNewStatusTitle("");
      setIsStatusComplete(false);
    },
  });

  const submitStatus = () => {
    if (newStatusTitle.trim()) {
      createStatusMutation.mutate({
        title: newStatusTitle,
        position: (statuses?.length || 0) + 1,
        isComplete: isStatusComplete,
      });
    }
  };

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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer flex items-center gap-2">
                  <CirclePlus className="h-4 w-4" />
                  <span className="hidden lg:inline">Add Status</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Status</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-4 py-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitStatus();
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="board-title">Status Title</Label>
                    <Input
                      id="board-title"
                      value={newStatusTitle}
                      onChange={(e) => setNewStatusTitle(e.target.value)}
                      placeholder="e.g. In Review"
                      autoFocus
                    />
                  </div>
                  <Field
                    orientation="horizontal"
                    className="flex items-center gap-2 mt-2"
                  >
                    <Checkbox
                      id="board-complete"
                      checked={isStatusComplete}
                      onCheckedChange={(checked) =>
                        setIsStatusComplete(checked === true)
                      }
                    />
                    <Label htmlFor="board-complete" className="cursor-pointer">
                      Mark as 'Done' status
                    </Label>
                  </Field>
                </form>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitStatus}
                    disabled={
                      createStatusMutation.isPending || !newStatusTitle.trim()
                    }
                  >
                    {createStatusMutation.isPending
                      ? "Adding..."
                      : "Add Status"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
