import { TASKS } from "./tasksdata";

/* Convert all tasks into upcoming deadlines */
export function getUpcomingDeadlines(limit = 3) {
  const allTasks = [...TASKS.pending, ...TASKS.inProgress];

  return allTasks
    .map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project,
      date: new Date(task.due),
      time: "8:50 AM",
    }))
    .filter((d) => d.date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, limit);
}
