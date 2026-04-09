import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Paperclip, MessageSquare, Clock, Play, Pause } from "lucide-react";
import type { Task, TaskPriority } from "@/types/task";

const TaskCard = ({ task }: { task: Task }) => {
  const [isRunning, setIsRunning] = useState(false);
  const visibleMembers = task.members.slice(0, 3);
  const remainingCount = task.members.length - 3;

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
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      </div>

      <div className="flex -space-x-2">
        {visibleMembers.map((m) => (
          <Avatar key={m.id} className="size-6 border-2 border-card">
            <AvatarImage src={m.avatar} alt={m.name} />
            <AvatarFallback className="text-[10px]">
              {m.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}

        {remainingCount > 0 && (
          <Avatar className="size-6 border-2 border-card bg-muted">
            <AvatarFallback className="text-[10px]">+10</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={`text-[11px] px-2 py-0.5 ${
            priorityStyles[task.priority as TaskPriority]
          }`}
        >
          {task.priority}
        </Badge>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-xs">
            <Paperclip className="size-3" /> {task.attachments}
          </span>

          <span className="flex items-center gap-1 text-xs">
            <MessageSquare className="size-3" /> {task.comments}
          </span>

          {/* Logged Time */}
          <span
            className={`flex items-center gap-1 text-xs ${
              isRunning ? "text-green-500 font-medium" : ""
            }`}
          >
            <Clock className="size-3" /> 14:20
          </span>

          {/* Play / Pause Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="ml-1 p-1 rounded hover:bg-muted transition"
          >
            {isRunning ? (
              <Pause className="size-4 text-red-500" />
            ) : (
              <Play className="size-4 text-green-500" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
