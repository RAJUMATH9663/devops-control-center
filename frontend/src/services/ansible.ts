import api from './api';

export interface AnsibleInventory {
  id: number;
  name: string;
  hosts: number;
  source: string;
}

export interface AnsiblePlaybook {
  id: number;
  name: string;
  description: string;
}

export interface AnsibleJob {
  id: string;
  playbook_id: number;
  inventory_id: number;
  status: string;
  started_at: string;
}

export const getInventories = async (): Promise<AnsibleInventory[]> => {
  const response = await api.get('/ansible/inventories');
  return response.data;
};

export const getPlaybooks = async (): Promise<AnsiblePlaybook[]> => {
  const response = await api.get('/ansible/playbooks');
  return response.data;
};

export const getJobs = async (): Promise<AnsibleJob[]> => {
  const response = await api.get('/ansible/jobs');
  return response.data;
};

export const executePlaybook = async (playbookId: number, inventoryId: number): Promise<any> => {
  const response = await api.post(`/ansible/playbooks/${playbookId}/execute?inventory_id=${inventoryId}`);
  return response.data;
};
