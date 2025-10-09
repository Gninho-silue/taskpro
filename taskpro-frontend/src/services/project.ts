import api from './api';
import { Project, CreateProjectData, UpdateProjectData } from '../types/project.types';
import { PaginatedResponse } from '../types/common.types';

export const projectService = {
  async getAllProjects(page = 0, size = 20): Promise<PaginatedResponse<Project>> {
    const response = await api.get<PaginatedResponse<Project>>(
      `/projects?page=${page}&size=${size}`
    );
    return response.data;
  },

  async getMyProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/user');
    return response.data;
  },

  async getProjectById(projectId: number): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(projectData: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  },

  async updateProject(projectId: number, projectData: UpdateProjectData): Promise<Project> {
    const response = await api.put<Project>(`/projects/${projectId}`, projectData);
    return response.data;
  },

  async deleteProject(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async addMemberToProject(projectId: number, userId: number): Promise<Project> {
    const response = await api.post<Project>(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  async removeMemberFromProject(projectId: number, userId: number): Promise<Project> {
    const response = await api.delete<Project>(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};