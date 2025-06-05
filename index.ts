import neodoc from "npm:neodoc";
import { USAGE } from "./constants.ts";
import { PersonalTodoist, TodoistAPI } from "./api.ts";

const args = neodoc.run(USAGE, { optionsFirst: true, smartOptions: true });

const api = new TodoistAPI();
const client = new PersonalTodoist(api);

function summariseTask(task) {
  let message = task.content;

  if (task.labels && task.labels.length > 0) {
    message += ` [${task.labels.join(", ")}]`;
  }

  if (task.due && task.due.date) {
    message += ` | Due: ${task.due.date} |`;
  }

  if (task.priority > 1) {
    message += ` P${task.priority} |`;
  }

  return message;
}

async function getTasks(args) {
  const tasks = await client.getInboxTasks();

  if (args["--json"]) {
    console.log(JSON.stringify(tasks, null, 2));
  } else {
    for (const [section, tsk] of Object.entries(tasks)) {
      console.log(`\nSection: ${section}`);
      for (const task of tsk) {
        console.log(`- ${summariseTask(task)}`);
      }
    }
  }
}

if (args["get-tasks"]) {
  getTasks(args).catch((error) => {
    console.error("Error fetching tasks:", error);
    Deno.exit(1);
  });
}
