import api from './api';

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export const getProjects = async () => {
  const response = await api.get('/projects/');
  return response.data;
};

export const createProject = async (project: ProjectCreate) => {
  const response = await api.post('/projects/', project);
  return response.data;
};

export const deleteProject = async (id: number) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
