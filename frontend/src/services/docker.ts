import api from './api';

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'restarting';
  ports: string;
  created: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface DockerVolume {
  name: string;
  driver: string;
  size: string;
  in_use: boolean;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
}

export const getContainers = async (): Promise<DockerContainer[]> => {
  const response = await api.get('/docker/containers');
  return response.data;
};

export const getImages = async (): Promise<DockerImage[]> => {
  const response = await api.get('/docker/images');
  return response.data;
};

export const getVolumes = async (): Promise<DockerVolume[]> => {
  const response = await api.get('/docker/volumes');
  return response.data;
};

export const getNetworks = async (): Promise<DockerNetwork[]> => {
  const response = await api.get('/docker/networks');
  return response.data;
};

export const restartContainer = async (id: string): Promise<any> => {
  const response = await api.post(`/docker/containers/${id}/restart`);
  return response.data;
};

export const deleteImage = async (id: string): Promise<any> => {
  const response = await api.delete(`/docker/images/${id}`);
  return response.data;
};

export const getContainerLogs = async (id: string): Promise<{logs: string}> => {
  const response = await api.get(`/docker/containers/${id}/logs`);
  return response.data;
};
