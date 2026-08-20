import api from './api';

export interface SastMetric {
  project: string;
  grade: string;
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  coverage: string;
  last_scan: string;
}

export interface ImageScan {
  image: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  status: string;
  last_scan: string;
}

export interface VaultSecret {
  engine: string;
  path: string;
  version: number;
  created_at: string;
}

export const getSastMetrics = async (): Promise<SastMetric[]> => {
  const response = await api.get('/security/sast');
  return response.data;
};

export const getImageScans = async (): Promise<ImageScan[]> => {
  const response = await api.get('/security/images');
  return response.data;
};

export const getVaultSecrets = async (): Promise<VaultSecret[]> => {
  const response = await api.get('/security/secrets');
  return response.data;
};

export const triggerScan = async (target: string): Promise<any> => {
  const response = await api.post(`/security/scan?target=${target}`);
  return response.data;
};
