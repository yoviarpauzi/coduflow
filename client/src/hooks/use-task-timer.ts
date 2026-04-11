import { useEffect, useState } from "react";
import { useTaskMutation } from "@/hooks/use-task-mutation";

type UseTaskTimerParams = {
  taskId: string;
  loggedTime?: number;
};

const formatTime = (totalSecs: number) => {
  const min = Math.floor(totalSecs / 60);
  const sec = totalSecs % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export const useTaskTimer = ({ taskId, loggedTime = 0 }: UseTaskTimerParams) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const { updateTaskLoggedTime, isUpdatingLoggedTime } = useTaskMutation();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      updateTaskLoggedTime({
        id: taskId,
        loggedTime: loggedTime + sessionSeconds,
      });
      setIsRunning(false);
      setSessionSeconds(0);
      return;
    }

    setIsRunning(true);
  };

  return {
    isRunning,
    toggleTimer,
    isUpdatingLoggedTime,
    currentDisplayTime: formatTime(loggedTime + sessionSeconds),
  };
};
