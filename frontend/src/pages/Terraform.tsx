import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaces, getRuns, triggerPlan, triggerApply } from '../services/terraform';
import type { TerraformWorkspace } from '../services/terraform';
import { 
  CloudRain, Play, ShieldAlert, 
  Clock, Loader2, Cloud, TerminalSquare
} from 'lucide-react';

const TerraformIntegration = () => {
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<TerraformWorkspace | null>(null);

  const { data: workspaces, isLoading: workspacesLoading } = useQuery(['tf-workspaces'], getWorkspaces);

  const { data: runs, isLoading: runsLoading } = useQuery(
    ['tf-runs', selectedWorkspace?.name],
    () => getRuns(selectedWorkspace!.name),
    { enabled: !!selectedWorkspace }
  );

  const planMutation = useMutation((name: string) => triggerPlan(name), {
    onSuccess: () => queryClient.invalidateQueries(['tf-runs', selectedWorkspace?.name])
  });

  const applyMutation = useMutation((name: string) => triggerApply(name), {
    onSuccess: () => queryClient.invalidateQueries(['tf-runs', selectedWorkspace?.name])
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Applied</span>;
      case 'planned': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Planned</span>;
      case 'applying': 
      case 'planning': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center w-max"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> In Progress</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Cloud className="w-6 h-6 mr-3 text-purple-600" />
            Terraform Infrastructure
          </h1>
          <p className="text-slate-500 mt-1">Manage infrastructure as code workspaces, plans, and state.</p>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Workspace List */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-medium">Workspaces</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {workspacesLoading ? (
              <div className="text-sm text-slate-500 text-center py-4">Loading workspaces...</div>
            ) : workspaces?.map((ws) => (
              <div 
                key={ws.name} 
                onClick={() => setSelectedWorkspace(ws)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedWorkspace?.name === ws.name ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-dark-border hover:border-purple-300 dark:hover:border-purple-700'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-900 dark:text-slate-100 truncate pr-2">{ws.name}</div>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700">{ws.provider}</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Env: {ws.environment}</span>
                  <span>v{ws.terraform_version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Runs & Actions */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {selectedWorkspace ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedWorkspace.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">Provider: {selectedWorkspace.provider} | Env: {selectedWorkspace.environment}</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => planMutation.mutate(selectedWorkspace.name)}
                    disabled={planMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {planMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                    Plan
                  </button>
                  <button 
                    onClick={() => applyMutation.mutate(selectedWorkspace.name)}
                    disabled={applyMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {applyMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Apply
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="font-medium mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-slate-400" /> Recent Runs
                </h3>
                
                <div className="space-y-4">
                  {runsLoading ? (
                    <div className="text-sm text-slate-500">Fetching runs...</div>
                  ) : runs?.length === 0 ? (
                    <div className="text-sm text-slate-500 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No runs recorded for this workspace.</div>
                  ) : runs?.map((run) => (
                    <div key={run.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <TerminalSquare className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">Terraform {run.type}</div>
                          <div className="text-xs text-slate-500 mt-1">Run ID: {run.id} • {new Date(run.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(run.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <CloudRain className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>Select a workspace to view state and trigger runs.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerraformIntegration;
