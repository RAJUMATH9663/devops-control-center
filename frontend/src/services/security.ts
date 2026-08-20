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

export interface SonarQubeStatus {
  project_key: string;
  quality_gate: string;
  metrics: {
    coverage: string;
    bugs: number;
    vulnerabilities: number;
    code_smells: number;
    duplicated_lines_density: string;
    security_rating: string;
    reliability_rating: string;
    maintainability_rating: string;
  };
  last_analysis: string;
}

export interface TrivyScanResult {
  target: string;
  scan_type: string;
  timestamp: string;
  status: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  vulnerabilities: Array<{
    cve_id: string;
    pkg_name: string;
    installed_version: string;
    fixed_version: string;
    severity: string;
    cvss: number;
    title: string;
    remediation: string;
  }>;
}

export interface ComplianceScorecard {
  overall_score: string;
  grade: string;
  standards: Array<{
    name: string;
    score: string;
    passed: number;
    total: number;
    status: string;
  }>;
  last_evaluated: string;
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

export const getSonarQubeStatus = async (): Promise<SonarQubeStatus> => {
  const response = await api.get('/security/sonarqube/status');
  return response.data;
};

export const runTrivyScan = async (target: string = 'repo'): Promise<TrivyScanResult> => {
  const response = await api.post('/security/trivy/scan', null, { params: { target } });
  return response.data;
};

export const getComplianceScore = async (): Promise<ComplianceScorecard> => {
  const response = await api.get('/security/compliance');
  return response.data;
};
