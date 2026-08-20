import api from './api';

export interface K8sNamespace {
  name: string;
  status: string;
  age: string;
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  ready: string;
  up_to_date: string;
  available: string;
  age: string;
}

export interface K8sPod {
  name: string;
  namespace: string;
  ready: string;
  status: string;
  restarts: string;
  age: string;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: string;
  cluster_ip: string;
  external_ip: string;
  ports: string;
}

export const getNamespaces = async (): Promise<K8sNamespace[]> => {
  const response = await api.get('/kubernetes/namespaces');
  return response.data;
};

export const getDeployments = async (): Promise<K8sDeployment[]> => {
  const response = await api.get('/kubernetes/deployments');
  return response.data;
};

export const getPods = async (): Promise<K8sPod[]> => {
  const response = await api.get('/kubernetes/pods');
  return response.data;
};

export const getServices = async (): Promise<K8sService[]> => {
  const response = await api.get('/kubernetes/services');
  return response.data;
};

export const scaleDeployment = async (name: string, replicas: number): Promise<any> => {
  const response = await api.post(`/kubernetes/deployments/${name}/scale?replicas=${replicas}`);
  return response.data;
};

export const restartPod = async (name: string): Promise<any> => {
  const response = await api.post(`/kubernetes/pods/${name}/restart`);
  return response.data;
};
