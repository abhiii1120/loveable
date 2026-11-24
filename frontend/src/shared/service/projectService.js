import { httpClient } from "./httpClient";

export const projectService = {
  async list() {
    const response = await httpClient.get("/api/projects");
    return response.data?.projects ?? response.projects;
  },

  async create(title) {
    const payload = typeof title === "string" ? { title } : title;
    const response = await httpClient.post("/api/projects", payload);
    return response.data?.project ?? response.project;
  },

  async launch(projectId) {
    const response = await httpClient.post(`/api/projects/${projectId}/launch`);
    return response.data?.project ?? response.project;
  },
};

export const projectsApi = projectService;

export default projectService;
