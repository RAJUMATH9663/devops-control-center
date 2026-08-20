import api from './api';

export interface K8sNamespace {
  name: string;
  status: string;
  age: string;
}

export interface K8sDeployment {
  id?: string;
  name: string;
  namespace: string;
  replicas?: number;
  ready?: string;
  up_to_date?: string;
  available?: string | number;
  image?: string;
  status?: string;
  age?: string;
}

export interface K8sPod {
  id?: string;
  name: string;
  namespace: string;
  deployment?: string;
  ready?: string;
  status: string;
  restarts: string | number;
  node?: string;
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

export const getDeployments = async (namespace?: string): Promise<K8sDeployment[]> => {
  const response = await api.get('/kubernetes/deployments', {
    params: { namespace },
  });
  return response.data;
};

export const getPods = async (namespace?: string): Promise<K8sPod[]> => {
  const response = await api.get('/kubernetes/pods', {
    params: { namespace },
  });
  return response.data;
};

export const getServices = async (): Promise<K8sService[]> => {
  const response = await api.get('/kubernetes/services');
  return response.data;
};

export const scaleDeployment = async (name: string, replicas: number, namespace: string = 'devops-control-center'): Promise<any> => {
  const response = await api.post(`/kubernetes/deployments/${name}/scale`, {
    replicas,
    namespace,
  });
  return response.data;
};

export const restartPod = async (name: string, namespace: string = 'devops-control-center'): Promise<any> => {
  const response = await api.post(`/kubernetes/pods/${name}/restart`, null, {
    params: { namespace },
  });
  return response.data;
};

export const getPodLogs = async (name: string, namespace: string = 'devops-control-center'): Promise<{ logs: string }> => {
  const response = await api.get<{ logs: string }>(`/kubernetes/pods/${name}/logs`, {
    params: { namespace },
  });
  return response.data;
};
