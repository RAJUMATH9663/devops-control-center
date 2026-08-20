import api from './api';

export interface SystemMetrics {
  cpu_usage: string;
  cpu_value: number;
  memory_usage: string;
  memory_value: number;
  disk_usage: string;
  disk_value: number;
  request_rate: string;
  p95_latency: string;
  network_in: string;
  network_out: string;
  containers_healthy: number;
  containers_total: number;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info' | string;
  name: string;
  expr?: string;
  for?: string;
  status: string;
  description: string;
}

export interface SystemLog {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

export const getMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get('/monitoring/metrics');
  return response.data;
};

export const getAlerts = async (): Promise<SystemAlert[]> => {
  const response = await api.get('/monitoring/alerts');
  return response.data;
};

export const getLogs = async (): Promise<SystemLog[]> => {
  const response = await api.get('/monitoring/logs');
  return response.data;
};
