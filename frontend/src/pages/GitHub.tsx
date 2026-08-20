import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getRepositories, getCommits, getPullRequests, getIssues, getWebhookHistory 
} from '../services/github';
import type { GitHubRepository } from '../services/github';
import { 
  GitPullRequest, Star, GitBranch, GitCommit, GitPullRequest as Github, 
  Lock, Globe, CheckCircle2, AlertCircle, Copy, Webhook, Zap
} from 'lucide-react';

const GitHubIntegration = () => {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'issues' | 'webhooks'>('commits');

  const { data: repositories, isLoading: reposLoading } = useQuery(['github-repos'], getRepositories);

  const [owner, repoName] = selectedRepo ? selectedRepo.full_name.split('/') : ['', ''];

  const { data: commits, isLoading: commitsLoading } = useQuery(
    ['github-commits', owner, repoName], 
    () => getCommits(owner, repoName),
    { enabled: !!selectedRepo && activeTab === 'commits' }
  );

  const { data: prs, isLoading: prsLoading } = useQuery(
    ['github-prs', owner, repoName], 
    () => getPullRequests(owner, repoName),
    { enabled: !!selectedRepo && activeTab === 'prs' }
  );

  const { data: issues, isLoading: issuesLoading } = useQuery(
    ['github-issues', owner, repoName], 
    () => getIssues(owner, repoName),
    { enabled: !!selectedRepo && activeTab === 'issues' }
  );

  const { data: webhookHistory, isLoading: webhooksLoading } = useQuery(
    ['github-webhooks-history'],
    getWebhookHistory,
    { enabled: activeTab === 'webhooks', refetchInterval: 5000 }
  );

  const handleCopyCloneUrl = (url: string) => {
    navigator.clipboard.writeText(`git clone ${url}`);
    alert('Clone command copied to clipboard!');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Github className="w-6 h-6 mr-3 text-slate-800 dark:text-slate-200" />
            GitHub Integrations & Webhooks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage repositories, pull requests, issues, and automated webhook triggers.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('webhooks')}
          className="px-4 py-2 bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium rounded-md shadow-sm flex items-center"
        >
          <Webhook className="w-4 h-4 mr-2" /> Webhook Events
        </button>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Repository List */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-medium">Repositories</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {reposLoading ? (
              <div className="p-4 text-sm text-slate-500">Loading repositories...</div>
            ) : repositories?.map((repo) => (
              <div 
                key={repo.id} 
                onClick={() => { setSelectedRepo(repo); if (activeTab === 'webhooks') setActiveTab('commits'); }}
                className={`p-4 border-b border-slate-200 dark:border-dark-border cursor-pointer transition-colors ${selectedRepo?.id === repo.id ? 'bg-brand-50 dark:bg-brand-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                    {repo.private ? <Lock className="w-3.5 h-3.5 mr-2 text-amber-500" /> : <Globe className="w-3.5 h-3.5 mr-2 text-emerald-500" />}
                    {repo.name}
                  </div>
                  <span className="flex items-center text-xs text-slate-500">
                    <Star className="w-3.5 h-3.5 mr-1" /> {repo.stargazers_count}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center"><GitBranch className="w-3.5 h-3.5 mr-1" /> {repo.default_branch}</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{repo.language}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Details, Commits, PRs, or Webhooks */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {activeTab === 'webhooks' ? (
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center">
                  <Webhook className="w-5 h-5 mr-2 text-brand-500" />
                  GitHub Webhook Dispatcher
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Automated HMAC-SHA256 verified webhooks that trigger CI/CD pipelines and security scans.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-dark-border font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payload URL:</span>
                  <span className="text-brand-500 font-bold">https://api.devops.internal/api/v1/github/webhook</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Content type:</span>
                  <span className="text-slate-800 dark:text-slate-200">application/json</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Secret Signature Header:</span>
                  <span className="text-purple-500 font-semibold">X-Hub-Signature-256 (HMAC-SHA256)</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Recent Webhook Deliveries</h4>
                <div className="border border-slate-200 dark:border-dark-border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
                    <thead className="bg-slate-50 dark:bg-slate-900/80">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Event</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Repository</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Sender</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase">Actions Triggered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-dark-border text-xs">
                      {webhooksLoading ? (
                        <tr><td colSpan={4} className="p-4 text-center text-slate-500">Loading deliveries...</td></tr>
                      ) : webhookHistory && webhookHistory.length > 0 ? (
                        webhookHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-mono font-bold text-brand-500 flex items-center">
                              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                              {item.event.toUpperCase()}
                            </td>
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-mono">{item.repository}</td>
                            <td className="px-4 py-3 text-slate-500">@{item.sender}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                {item.actions_triggered.map((action, idx) => (
                                  <div key={idx} className="text-emerald-600 dark:text-emerald-400 flex items-center">
                                    <CheckCircle2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {action}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            No webhook events received yet. Push code to trigger events.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : selectedRepo ? (
            <>
              {/* Repo Header */}
              <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedRepo.full_name}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                    <span>Default: <strong className="text-slate-700 dark:text-slate-300">{selectedRepo.default_branch}</strong></span>
                    <span>Language: <strong className="text-slate-700 dark:text-slate-300">{selectedRepo.language}</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopyCloneUrl(selectedRepo.clone_url)}
                  className="flex items-center px-3 py-1.5 border border-slate-300 dark:border-dark-border rounded-md text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Clone URL
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-dark-border px-6">
                <button 
                  onClick={() => setActiveTab('commits')}
                  className={`py-3 mr-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'commits' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500'}`}
                >
                  <GitCommit className="w-4 h-4 mr-2" /> Commits
                </button>
                <button 
                  onClick={() => setActiveTab('prs')}
                  className={`py-3 mr-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'prs' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500'}`}
                >
                  <GitPullRequest className="w-4 h-4 mr-2" /> Pull Requests
                </button>
                <button 
                  onClick={() => setActiveTab('issues')}
                  className={`py-3 mr-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'issues' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500'}`}
                >
                  <AlertCircle className="w-4 h-4 mr-2" /> Issues
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'commits' && (
                  <div className="space-y-4">
                    {commitsLoading ? (
                      <div className="text-sm text-slate-500">Loading commits...</div>
                    ) : commits?.map((c) => (
                      <div key={c.sha} className="p-3 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{c.commit.message}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {c.commit.author.name} committed on {new Date(c.commit.author.date).toLocaleString()}
                          </div>
                        </div>
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {c.sha.substring(0, 7)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'prs' && (
                  <div className="space-y-4">
                    {prsLoading ? (
                      <div className="text-sm text-slate-500">Loading pull requests...</div>
                    ) : prs?.map((pr) => (
                      <div key={pr.id} className="p-3 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center">
                        <div className="flex items-start">
                          <GitPullRequest className="w-4 h-4 mr-3 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{pr.title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              #{pr.number} opened by {pr.user.login} on {new Date(pr.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                          {pr.state}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {issuesLoading ? (
                      <div className="text-sm text-slate-500">Loading issues...</div>
                    ) : issues?.map((issue) => (
                      <div key={issue.id} className="p-3 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 mr-3 text-amber-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{issue.title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              #{issue.number} opened by {issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                          {issue.state}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a repository to view commits, PRs, issues, or webhooks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubIntegration;
