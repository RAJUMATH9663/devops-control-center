import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getWorkspaces, getRuns, triggerPlan, triggerApply, 
  getTerraformState, getTerraformRunLogs 
} from '../services/terraform';
import type { TerraformWorkspace, TerraformRun } from '../services/terraform';
import { LogTerminal } from '../components/common/LogTerminal';
import { 
  CloudRain, Play, ShieldAlert, 
  Clock, Loader2, Cloud, TerminalSquare, Database, X, Eye
} from 'lucide-react';

const TerraformIntegration = () => {
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<TerraformWorkspace | null>(null);
  const [activeTab, setActiveTab] = useState<'runs' | 'state'>('runs');
  const [selectedRun, setSelectedRun] = useState<TerraformRun | null>(null);

  const { data: workspaces, isLoading: workspacesLoading } = useQuery(['tf-workspaces'], getWorkspaces);

  const { data: runs, isLoading: runsLoading } = useQuery(
    ['tf-runs', selectedWorkspace?.name],
    () => getRuns(selectedWorkspace!.name),
    { enabled: !!selectedWorkspace }
  );

  const { data: stateData, isLoading: stateLoading } = useQuery(
    ['tf-state', selectedWorkspace?.name],
    () => getTerraformState(selectedWorkspace!.name),
    { enabled: !!selectedWorkspace && activeTab === 'state' }
  );

  const { data: runLogsData, isLoading: runLogsLoading } = useQuery(
    ['tf-run-logs', selectedRun?.id],
    () => getTerraformRunLogs(selectedRun!.id),
    { enabled: !!selectedRun }
  );

  const planMutation = useMutation((name: string) => triggerPlan(name), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tf-runs', selectedWorkspace?.name]);
      if (data?.run) setSelectedRun(data.run);
    }
  });

  const applyMutation = useMutation((name: string) => triggerApply(name), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tf-runs', selectedWorkspace?.name]);
      if (data?.run) setSelectedRun(data.run);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs rounded-full font-semibold">Applied</span>;
      case 'planned': return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full font-semibold">Planned</span>;
      case 'applying': 
      case 'planning': return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs rounded-full font-semibold flex items-center w-max"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> In Progress</span>;
      default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 text-xs rounded-full font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Cloud className="w-6 h-6 mr-3 text-purple-600" />
            Terraform Infrastructure as Code
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage infrastructure workspaces, review plan diffs, execute applies, and inspect state outputs.
          </p>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Workspace List */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-medium">Infrastructure Workspaces</h3>
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
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700 uppercase font-mono">
                    {ws.environment}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Resources: <strong>{ws.resource_count || 12}</strong></span>
                  <span>v{ws.terraform_version || '1.8.0'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Runs, State & Actions */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {selectedWorkspace ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedWorkspace.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">Environment: {selectedWorkspace.environment} | Status: <strong className="uppercase">{selectedWorkspace.status}</strong></p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => planMutation.mutate(selectedWorkspace.name)}
                    disabled={planMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {planMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />}
                    Generate Plan
                  </button>
                  <button 
                    onClick={() => applyMutation.mutate(selectedWorkspace.name)}
                    disabled={applyMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {applyMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Apply Changes
                  </button>
                </div>
              </div>

              {/* Tabs: Runs vs State */}
              <div className="flex border-b border-slate-200 dark:border-dark-border px-6">
                <button 
                  onClick={() => setActiveTab('runs')}
                  className={`py-3 mr-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'runs' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500'}`}
                >
                  <Clock className="w-4 h-4 mr-2" /> Execution Runs
                </button>
                <button 
                  onClick={() => setActiveTab('state')}
                  className={`py-3 mr-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'state' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500'}`}
                >
                  <Database className="w-4 h-4 mr-2" /> State Outputs
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'runs' && (
                  <div className="space-y-4">
                    {runsLoading ? (
                      <div className="text-sm text-slate-500">Fetching runs...</div>
                    ) : runs?.length === 0 ? (
                      <div className="text-sm text-slate-500 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No runs recorded for this workspace.</div>
                    ) : runs?.map((run) => (
                      <div key={run.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                            <TerminalSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100 capitalize flex items-center">
                              Terraform {run.type}
                              <span className="ml-2 text-xs font-mono text-slate-400">({run.id})</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {run.plan_summary || `Triggered by ${run.triggered_by || 'admin'}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(run.status)}
                          <button 
                            onClick={() => setSelectedRun(run)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded"
                            title="View Console Output"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'state' && (
                  <div>
                    {stateLoading ? (
                      <div className="text-sm text-slate-500">Loading state outputs...</div>
                    ) : stateData?.outputs ? (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-500 font-mono">
                          State Lineage: {stateData.lineage} | Serial: {stateData.serial}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(stateData.outputs).map(([key, output]) => (
                            <div key={key} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-dark-border">
                              <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{key}</div>
                              <div className="text-sm font-mono mt-1 text-slate-800 dark:text-slate-200">{String(output.value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">No state outputs found.</div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <CloudRain className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>Select a workspace to view state, review runs, and trigger applies.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terraform Run Console Output Modal */}
      {selectedRun && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg p-6">
          <div className="w-full h-full max-w-5xl rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
            <button 
              onClick={() => setSelectedRun(null)} 
              className="absolute top-2.5 right-3 z-30 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
            <LogTerminal 
              logs={runLogsLoading ? 'Streaming terraform execution logs...' : runLogsData?.logs || 'No logs available.'} 
              title={`Terraform ${selectedRun.type.toUpperCase()}: ${selectedRun.workspace} (${selectedRun.id})`}
              isStreaming={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TerraformIntegration;
