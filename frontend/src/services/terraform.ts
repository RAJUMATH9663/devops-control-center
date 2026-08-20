import api from './api';

export interface TerraformWorkspace {
  id?: string;
  name: string;
  environment: string;
  terraform_version?: string;
  resource_count?: number;
  locked?: boolean;
  last_run?: string;
  status: string;
}

export interface TerraformRun {
  id: string;
  workspace: string;
  type: string;
  status: string;
  triggered_by?: string;
  timestamp?: string;
  plan_summary?: string;
  resources_added?: number;
  resources_changed?: number;
  resources_deleted?: number;
}

export interface TerraformState {
  workspace: string;
  format_version: string;
  terraform_version: string;
  serial: number;
  lineage: string;
  outputs: Record<string, { value: any; type: string }>;
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

export const getTerraformState = async (workspaceName: string): Promise<TerraformState> => {
  const response = await api.get(`/terraform/workspaces/${workspaceName}/state`);
  return response.data;
};

export const getTerraformRunLogs = async (runId: string): Promise<{ run_id: string; logs: string }> => {
  const response = await api.get(`/terraform/runs/${runId}/logs`);
  return response.data;
};
