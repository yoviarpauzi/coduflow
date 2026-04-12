import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause } from "lucide-react";
import type { Task, TaskPriority } from "@/types/task";
import { useTaskTimer } from "@/hooks/use-task-timer";

export const TaskCard = ({
  task,
  isStatusComplete = false,
}: {
  task: Task;
  isStatusComplete?: boolean;
}) => {
  const { isRunning, toggleTimer, isUpdatingLoggedTime, currentDisplayTime } =
    useTaskTimer({
      taskId: task.id,
      loggedTime: task.loggedTime || 0,
    });

  const priorityStyles: Record<TaskPriority, string> = {
    High: "border-red-500/30 text-red-400 bg-red-500/10",
    Medium: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    Low: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    None: "border-gray-500/30 text-gray-400 bg-gray-500/10",
  };

  return (
    <>
      <div>
        <p className="font-semibold text-sm leading-snug">{task.title}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {task.description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {task.priority ? (
          <Badge
            variant="outline"
            className={`text-[11px] px-2 py-0.5 ${
              priorityStyles[task.priority as TaskPriority]
            }`}
          >
            {task.priority}
          </Badge>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 text-muted-foreground">
          {/* Logged Time */}
          <span
            className={`flex items-center gap-1 text-xs ${
              isRunning ? "text-cyan-700 font-medium" : ""
            }`}
          >
            <Clock className="size-3" /> {currentDisplayTime}
          </span>

          {/* Play / Pause Button */}
          {!isStatusComplete && (
            <button
              onClick={toggleTimer}
              disabled={isUpdatingLoggedTime}
              className="ml-1 p-1 rounded hover:bg-muted transition"
            >
              {isRunning ? (
                <Pause className="size-4 text-red-500" />
              ) : (
                <Play className="size-4 text-green-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
