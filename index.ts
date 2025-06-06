import { USAGE } from "./constants.ts";
import { PersonalTodoist, TodoistAPI } from "./api.ts";
import { neodoc, ansi } from "./deps.ts";

const args = neodoc.run(USAGE, { optionsFirst: true, smartOptions: true });

const api = new TodoistAPI();
const client = new PersonalTodoist(api);

function summariseTask(task) {
  let content = task.content.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
  if (content.length > 47) {
    content = content.slice(0, 47) + "...";
  }
  let message = content.padEnd(50, " ");

  if (task.labels && task.labels.length > 0) {
    message += ansi.blue(` [${task.labels.join(", ")}]`.padEnd(20, " "));
  } else {
    message += ''.padEnd(20, " ");
  }

  // TODO check if due today / tomorrow
  // TODO check if recurring

  const isDueToday = task.due?.date && new Date(task.due.date).toDateString() === new Date().toDateString()

  if (task.due && task.due.date) {
    const dueString =
      isDueToday ? ansi.red(task.due.string) : task.due.string;
    message += ` | Due: ${dueString}`.padEnd(40, " ")
  }

  if (task.priority > 1) {
    message += `| P${task.priority} |`;
  }

  return message;
}

async function getTasks(args) {
  const tasks = await client.getInboxTasks();

  if (args["--json"]) {
    console.log(JSON.stringify(tasks, null, 2));
  } else {
    for (const [section, tsk] of Object.entries(tasks)) {
      console.log(`\n${section}`);
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
