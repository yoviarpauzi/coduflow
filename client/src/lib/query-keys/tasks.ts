type TaskListFilters = {
  search?: string;
};

const normalizeSearch = (search?: string) => (search ?? "").trim().toLowerCase();

export const tasksKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskListFilters = {}) =>
    ["tasks", normalizeSearch(filters.search)] as const,
  statuses: ["task_status"] as const,
};
