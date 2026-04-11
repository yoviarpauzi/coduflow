import { useNavigate, useSearch } from "@tanstack/react-router";

export const useTaskSearchQuery = () => {
  const navigate = useNavigate({ from: "/_app/tasks" });
  const searchQuery = useSearch({ from: "/_app/tasks" });
  const value = searchQuery.search ?? "";

  const setValue = (nextValue: string) => {
    navigate({
      search: (prev: { search?: string }) => ({
        ...prev,
        search: nextValue || undefined,
      }),
      replace: true,
    });
  };

  return {
    value,
    setValue,
  };
};
