import api from './api';

export interface TerraformWorkspace {
  name: string;
  environment: string;
  provider: string;
  terraform_version: string;
  last_updated: string;
}

export interface TerraformRun {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

export const getWorkspaces = async (): Promise<TerraformWorkspace[]> => {
  const response = await api.get('/terraform/workspaces');
  return response.data;
};

export const getRuns = async (workspaceName: string): Promise<TerraformRun[]> => {
  const response = await api.get(`/terraform/workspaces/${workspaceName}/runs`);
  return response.data;
};

export const triggerPlan = async (workspaceName: string): Promise<any> => {
  const response = await api.post(`/terraform/workspaces/${workspaceName}/plan`);
  return response.data;
};

export const triggerApply = async (workspaceName: string): Promise<any> => {
  const response = await api.post(`/terraform/workspaces/${workspaceName}/apply`);
  return response.data;
};
