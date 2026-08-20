import api from './api';

export interface AnsibleInventory {
  id: number;
  name: string;
  hosts_count?: number;
  groups?: string[];
  variables?: Record<string, any>;
}

export interface AnsiblePlaybook {
  id: number;
  name: string;
  description: string;
  tasks_count?: number;
  created_at?: string;
}

export interface AnsibleJob {
  id: number | string;
  playbook_id: number;
  playbook_name?: string;
  inventory_id: number;
  inventory_name?: string;
  status: string;
  hosts_ok?: number;
  hosts_changed?: number;
  hosts_failed?: number;
  triggered_by?: string;
  started_at: string;
  duration?: string;
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

export const getAnsibleJobLogs = async (jobId: number | string): Promise<{ job_id: number | string; logs: string }> => {
  const response = await api.get(`/ansible/jobs/${jobId}/logs`);
  return response.data;
};
