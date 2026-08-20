import api from './api';

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  error_rate: number;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  name: string;
  target: string;
  started_at: string;
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
