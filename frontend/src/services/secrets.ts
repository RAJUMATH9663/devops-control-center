import api from './api';

export interface SecretMetadata {
  path: string;
  keys: string[];
  masked_data: Record<string, any>;
}

export interface MaskTestResult {
  original: string;
  masked: string;
  is_modified: boolean;
}

export interface AuditLogItem {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: string;
}

export const getSecretPaths = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/secrets/paths');
  return response.data;
};

export const getSecretView = async (path: string): Promise<SecretMetadata> => {
  const response = await api.get<SecretMetadata>('/secrets/view', {
    params: { path },
  });
  return response.data;
};

export const saveSecret = async (path: string, data: Record<string, any>): Promise<any> => {
  const response = await api.post('/secrets/', { path, data });
  return response.data;
};

export const testMaskSecrets = async (text: string): Promise<MaskTestResult> => {
  const response = await api.post<MaskTestResult>('/secrets/mask-test', { text });
  return response.data;
};

export const getAuditTrail = async (): Promise<AuditLogItem[]> => {
  const response = await api.get<AuditLogItem[]>('/secrets/audit');
  return response.data;
};
