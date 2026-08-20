import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getRepositories, getCommits, getPullRequests, getIssues 
} from '../services/github';
import type { GitHubRepository } from '../services/github';
import { 
  GitPullRequest, Star, GitBranch, GitCommit, GitPullRequest as Github, 
  Lock, Globe, CheckCircle2, AlertCircle, Copy
} from 'lucide-react';

const GitHubIntegration = () => {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'issues'>('commits');

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

  const handleCopyCloneUrl = (url: string) => {
    navigator.clipboard.writeText(`git clone ${url}`);
    alert('Clone command copied to clipboard!');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Github className="w-6 h-6 mr-3" />
            Advanced GitHub Integration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage repositories, PRs, issues, and track commits.</p>
        </div>
        <button className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 transition-colors text-sm font-medium rounded-md shadow-sm">
          Connect Repository
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
                onClick={() => setSelectedRepo(repo)}
                className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${selectedRepo?.id === repo.id ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-l-brand-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {repo.private ? <Lock className="w-4 h-4 text-slate-400" /> : <Globe className="w-4 h-4 text-slate-400" />}
                    <h4 className="font-medium text-brand-600 dark:text-brand-400 truncate max-w-[200px]" title={repo.name}>{repo.name}</h4>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                  <span className="flex items-center"><Star className="w-3 h-3 mr-1" /> {repo.stargazers_count}</span>
                  <span className="flex items-center"><GitBranch className="w-3 h-3 mr-1" /> {repo.default_branch}</span>
                  <span>{repo.language}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Repository Details & Activity */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {selectedRepo ? (
            <>
              {/* Repository Header */}
              <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedRepo.full_name}</h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <GitBranch className="w-4 h-4 mr-1" /> Default branch: {selectedRepo.default_branch}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCopyCloneUrl(selectedRepo.clone_url)}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm hover:bg-slate-50 transition-colors flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Clone
                    </button>
                    <a 
                      href={`https://github.com/${selectedRepo.full_name}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-3 py-1 bg-slate-900 text-white rounded text-sm hover:bg-slate-800 transition-colors flex items-center"
                    >
                      <Github className="w-4 h-4 mr-2" /> View on GitHub
                    </a>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border mt-4">
                  <button 
                    onClick={() => setActiveTab('commits')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'commits' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center"><GitCommit className="w-4 h-4 mr-2" /> Commits</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('prs')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prs' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center"><GitPullRequest className="w-4 h-4 mr-2" /> Pull Requests</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('issues')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'issues' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Issues</div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                
                {/* COMMITS TAB */}
                {activeTab === 'commits' && (
                  <div className="space-y-4">
                    {commitsLoading ? (
                      <div className="text-sm text-slate-500">Fetching commits...</div>
                    ) : commits?.map((commit) => (
                      <div key={commit.sha} className="flex border-l-2 border-slate-200 dark:border-dark-border pl-4 pb-4 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{commit.commit.message.split('\n')[0]}</p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">
                              {commit.sha.substring(0, 7)}
                            </span>
                            <span>by {commit.commit.author.name}</span>
                            <span>on {new Date(commit.commit.author.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PRs TAB */}
                {activeTab === 'prs' && (
                  <div className="space-y-4">
                    {prsLoading ? (
                      <div className="text-sm text-slate-500">Fetching pull requests...</div>
                    ) : prs?.length === 0 ? (
                      <div className="text-sm text-slate-500">No pull requests found.</div>
                    ) : prs?.map((pr) => (
                      <div key={pr.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-start hover:border-brand-300 transition-colors">
                        <div>
                          <div className="flex items-center">
                            {pr.state === 'open' ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <CheckCircle2 className="w-4 h-4 text-purple-500 mr-2" />}
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{pr.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 ml-6">
                            #{pr.number} opened on {new Date(pr.created_at).toLocaleDateString()} by {pr.user.login}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ISSUES TAB */}
                {activeTab === 'issues' && (
                  <div className="space-y-4">
                    {issuesLoading ? (
                      <div className="text-sm text-slate-500">Fetching issues...</div>
                    ) : issues?.length === 0 ? (
                      <div className="text-sm text-slate-500">No issues found.</div>
                    ) : issues?.map((issue) => (
                      <div key={issue.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-start hover:border-brand-300 transition-colors">
                        <div>
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-green-500 mr-2" />
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{issue.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 ml-6">
                            #{issue.number} opened on {new Date(issue.created_at).toLocaleDateString()} by {issue.user.login}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Github className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>Select a repository to view advanced details, PRs, and issues.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubIntegration;
