import api from './api';

export interface DORAMetricItem {
  metric: string;
  value: string;
  rating: string;
  description: string;
}

export interface DORAReport {
  deployment_frequency: DORAMetricItem;
  lead_time_for_changes: DORAMetricItem;
  mean_time_to_restore: DORAMetricItem;
  change_failure_rate: DORAMetricItem;
  overall_tier: string;
}

export const getDORAMetrics = async (): Promise<DORAReport> => {
  const response = await api.get<DORAReport>('/reports/dora');
  return response.data;
};

export const downloadDeploymentsCSV = async (): Promise<void> => {
  const response = await api.get('/reports/export/deployments', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'deployments_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
