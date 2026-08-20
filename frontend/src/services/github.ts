import api from './api';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  language: string;
  stargazers_count: number;
  private: boolean;
  default_branch: string;
  clone_url: string;
  ssh_url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: string;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  state: string;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
}

export const getRepositories = async (): Promise<GitHubRepository[]> => {
  const response = await api.get('/github/repositories');
  return response.data;
};

export const getCommits = async (owner: string, repo: string): Promise<GitHubCommit[]> => {
  const response = await api.get(`/github/${owner}/${repo}/commits`);
  return response.data;
};

export const getPullRequests = async (owner: string, repo: string): Promise<GitHubPullRequest[]> => {
  const response = await api.get(`/github/${owner}/${repo}/pulls`);
  return response.data;
};

export const getIssues = async (owner: string, repo: string): Promise<GitHubIssue[]> => {
  const response = await api.get(`/github/${owner}/${repo}/issues`);
  return response.data;
};
