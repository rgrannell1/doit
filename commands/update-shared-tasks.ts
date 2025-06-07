/*
 * Partition tasks into scheduled and unscheduled
 * @param {Array} tasks - Array of task objects
 */
function partitionTasks(tasks) {
  const scheduled = [];
  const unscheduled = [];

  for (const task of tasks) {
    if (task.due) {
      scheduled.push(task);
    } else {
      unscheduled.push(task);
    }
  }

  return { scheduled, unscheduled };
}

export async function updateSharedTasks(client, args) {
  // shared tasks aren't grouped into a section
  const { "No Section": tasks } = await client.getSharedTasks();

  // Partition tasks into scheduled and unscheduled
  // scheduled tasks need to be moved to the "Scheduled" section,
  // unscheduled tasks need to be moved to the "Notes, Options, Parcels" section
  const { scheduled, unscheduled } = partitionTasks(tasks);

  // Sequential to be polite to rate limits
  for (const tasks of scheduled) {
    await client.moveTaskToInboxSection(tasks.id, "⏰ Scheduled");
  }

  console.log(unscheduled);
}
