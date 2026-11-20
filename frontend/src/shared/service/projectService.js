import { httpClient } from "./httpClient";

export const projectService = {
  async list() {
    const response = await httpClient.get("/api/projects");
    return response.projects;
  },

  async create(title) {
    const response = await httpClient.post("/api/projects", title);
    return response.project;
  },

  async launch(projectId) {
    const response = await httpClient.post(`/api/projects/${projectId}/launch`);
    return response.project;
  },
};
