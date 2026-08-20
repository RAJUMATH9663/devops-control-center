import api from './api';

export interface JenkinsJob {
  name: string;
  url: string;
  last_build_number: number;
  status: 'SUCCESS' | 'FAILURE' | 'BUILDING' | 'ABORTED' | 'UNKNOWN';
  last_build_time: string | null;
}

export interface JenkinsBuild {
  build_number: number;
  status: 'SUCCESS' | 'FAILURE' | 'BUILDING' | 'ABORTED' | 'UNKNOWN';
  duration: string;
  timestamp: string;
}

export const getJenkinsJobs = async (): Promise<JenkinsJob[]> => {
  const response = await api.get('/jenkins/jobs');
  return response.data;
};

export const getJenkinsBuilds = async (jobName: string): Promise<JenkinsBuild[]> => {
  const response = await api.get(`/jenkins/builds/${jobName}`);
  return response.data;
};

export const triggerJenkinsBuild = async (jobName: string): Promise<any> => {
  const response = await api.post(`/jenkins/build/${jobName}`);
  return response.data;
};

export const cancelJenkinsBuild = async (jobName: string, buildNumber: number): Promise<any> => {
  const response = await api.post(`/jenkins/cancel/${jobName}/${buildNumber}`);
  return response.data;
};

export const getJenkinsLogs = async (jobName: string, buildNumber: number): Promise<{logs: string}> => {
  const response = await api.get(`/jenkins/logs/${jobName}/${buildNumber}`);
  return response.data;
};
