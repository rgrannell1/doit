import { TodoistApi } from "npm:@doist/todoist-api-typescript";
import { Config } from "./config.ts";

export type TaskFilters = {
  labels?: string[];
  priority?: number;
};

export class TodoistAPI {
  api: TodoistApi;
  projects: Promise<any[]> | undefined;
  sections: Promise<any[]> | undefined;

  constructor() {
    this.api = new TodoistApi(Config.getEnv("TODOIST_TOKEN"));
  }
  getTasks() {
    return this.api.getTasks();
  }
  getProjects() {
    if (this.projects) {
      return this.projects;
    }
    this.projects = this.api.getProjects();
    return this.projects;
  }

  async getProject(name: string) {
    const projects = await this.api.getProjects();
    return projects.find((project) => project.name === name);
  }

  async getProjectTasks(name: string) {
    const [tasks, project] = await Promise.all([
      this.api.getTasks(),
      this.getProject(name),
    ]);
    if (!project) {
      throw new Error(`Project with name "${name}" not found.`);
    }

    const sections = await this.getSections();

    return Object.groupBy(
      tasks.filter((task) => task.projectId === project.id),
      (task) => {
        const section = sections.find((section) =>
          section.id === task.sectionId
        );
        return section ? section.name : "No Section";
      },
    );
  }

  getSections() {
    if (this.sections) {
      return this.sections;
    }
    this.sections = this.api.getSections();
    return this.sections;
  }
}

export class PersonalTodoist {
  api: TodoistAPI;

  constructor(api: TodoistAPI) {
    this.api = api;
  }

  getSharedTasks() {
    return this.api.getProjectTasks("Shared");
  }

  getInboxTasks() {
    return this.api.getProjectTasks("Inbox");
  }
}
