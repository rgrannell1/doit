import { TodoistApi } from "./deps.ts";
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
    if (!this.projects) {
      this.projects = this.api.getProjects();
    }
    return this.projects;
  }

  async getProject(name: string) {
    const projects = await this.getProjects();
    return projects.find((project) => project.name === name);
  }

  async getSections() {
    if (!this.sections) {
      this.sections = this.api.getSections();
    }
    return this.sections;
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
        const section = sections.find((s) => s.id === task.sectionId);
        return section ? section.name : "No Section";
      },
    );
  }

  getSharedTasks() {
    return this.getProjectTasks("Shared");
  }

  getInboxTasks() {
    return this.getProjectTasks("Inbox");
  }

  async moveTaskToInboxSection(taskId: string, sectionName: string): Promise<void> {
    const sections = await this.getSections();
    const section = sections.find((s) => s.name === sectionName);
    if (!section) {
      throw new Error(`Section "${sectionName}" not found.`);
    }
    const projects = await this.getProjects();
    const inboxProject = projects.find((p) => p.name === "Inbox");
    if (!inboxProject) {
      throw new Error(`Project "Inbox" not found.`);
    }
    await this.api.moveTask(taskId, {
      projectId: inboxProject.id,
      sectionId: section.id,
    });
  }
}
