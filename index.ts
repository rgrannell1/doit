import { USAGE } from "./constants.ts";
import { neodoc, TodoistApi } from "./deps.ts";

import { getTasks, updateSharedTasks } from "./commands/index.ts";
import { TodoistAPI } from "./api.ts";

const args = neodoc.run(USAGE, { optionsFirst: true, smartOptions: true });

const client = new TodoistAPI();

if (args["get-tasks"]) {
  getTasks(client, args).catch((error) => {
    console.error("Error fetching tasks:", error);
    Deno.exit(1);
  });
} else if (args["update-shared-tasks"]) {
  updateSharedTasks(client, args).catch((error) => {
    console.error("Error updating shared tasks:", error);
    Deno.exit(1);
  });
}
