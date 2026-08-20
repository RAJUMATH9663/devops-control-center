import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getInventories, getPlaybooks, getJobs, executePlaybook, getAnsibleJobLogs
} from '../services/ansible';
import type { AnsiblePlaybook, AnsibleJob } from '../services/ansible';
import { LogTerminal } from '../components/common/LogTerminal';
import { 
  Terminal, Play, ListTree, Database, 
  Clock, Loader2, X, Eye
} from 'lucide-react';

const AnsibleIntegration = () => {
  const queryClient = useQueryClient();
  const [selectedPlaybook, setSelectedPlaybook] = useState<AnsiblePlaybook | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<AnsibleJob | null>(null);

  const { data: inventories, isLoading: inventoriesLoading } = useQuery(['ansible-inventories'], getInventories);
  const { data: playbooks, isLoading: playbooksLoading } = useQuery(['ansible-playbooks'], getPlaybooks);
  const { data: jobs, isLoading: jobsLoading } = useQuery(['ansible-jobs'], getJobs);

  const { data: jobLogsData, isLoading: jobLogsLoading } = useQuery(
    ['ansible-job-logs', selectedJob?.id],
    () => getAnsibleJobLogs(selectedJob!.id),
    { enabled: !!selectedJob }
  );

  const executeMutation = useMutation(
    ({ playbookId, inventoryId }: { playbookId: number, inventoryId: number }) => executePlaybook(playbookId, inventoryId), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['ansible-jobs']);
        if (data?.job) setSelectedJob(data.job);
      }
    }
  );

  const handleExecute = () => {
    if (selectedPlaybook && selectedInventory) {
      executeMutation.mutate({ playbookId: selectedPlaybook.id, inventoryId: selectedInventory });
    } else {
      alert("Please select both a Playbook and an Inventory.");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Terminal className="w-6 h-6 mr-3 text-red-600" />
            Ansible Configuration & Automation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Execute playbooks against dynamic inventories and stream task-by-task execution logs.
          </p>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Playbooks & Inventories */}
        <div className="w-1/3 flex flex-col space-y-6">
          
          {/* Playbooks */}
          <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-medium flex items-center"><ListTree className="w-4 h-4 mr-2" /> Playbooks</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {playbooksLoading ? (
                <div className="text-sm text-slate-500">Loading playbooks...</div>
              ) : playbooks?.map((pb) => (
                <div 
                  key={pb.id} 
                  onClick={() => setSelectedPlaybook(pb)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPlaybook?.id === pb.id ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-dark-border hover:border-red-300 dark:hover:border-red-700'}`}
                >
                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100 font-mono">{pb.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{pb.description}</div>
                  <div className="text-xs text-slate-400 mt-2">Tasks: {pb.tasks_count || 6}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventories */}
          <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-medium flex items-center"><Database className="w-4 h-4 mr-2" /> Target Inventories</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {inventoriesLoading ? (
                <div className="text-sm text-slate-500">Loading inventories...</div>
              ) : inventories?.map((inv) => (
                <div 
                  key={inv.id} 
                  onClick={() => setSelectedInventory(inv.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedInventory === inv.id ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-dark-border hover:border-red-300 dark:hover:border-red-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{inv.name}</div>
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
                      {inv.hosts_count || 8} hosts
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex gap-1">
                    {inv.groups?.map(g => (
                      <span key={g} className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">{g}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Pane: Execution & Jobs */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Automation Execution Engine</h2>
              <p className="text-sm text-slate-500 mt-1">
                {selectedPlaybook && selectedInventory 
                  ? `Ready to execute ${selectedPlaybook.name} on selected inventory.`
                  : "Select a Playbook and Target Inventory to trigger execution."}
              </p>
            </div>
            <button 
              onClick={handleExecute}
              disabled={executeMutation.isLoading || !selectedPlaybook || !selectedInventory}
              className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {executeMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Execute Playbook
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-medium mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-slate-400" /> Playbook Execution History
            </h3>
            
            <div className="space-y-4">
              {jobsLoading ? (
                <div className="text-sm text-slate-500">Fetching jobs...</div>
              ) : jobs?.length === 0 ? (
                <div className="text-sm text-slate-500 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No jobs executed yet. Select a playbook and inventory to begin.
                </div>
              ) : jobs?.map((job) => (
                <div key={job.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                        {job.playbook_name || `Playbook #${job.playbook_id}`}
                        <span className="ml-2 text-xs font-mono text-slate-400">Job #{job.id}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Inventory: {job.inventory_name || 'Production'} • Duration: {job.duration || '35s'} • {new Date(job.started_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full font-bold">
                        ok: {job.hosts_ok !== undefined ? job.hosts_ok : 8}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-bold">
                        changed: {job.hosts_changed !== undefined ? job.hosts_changed : 2}
                      </span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold">
                        failed: {job.hosts_failed !== undefined ? job.hosts_failed : 0}
                      </span>
                    </div>

                    <button 
                      onClick={() => setSelectedJob(job)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      title="View Execution Log"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ansible Job Output Terminal Modal */}
      {selectedJob && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg p-6">
          <div className="w-full h-full max-w-5xl rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
            <button 
              onClick={() => setSelectedJob(null)} 
              className="absolute top-2.5 right-3 z-30 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
            <LogTerminal 
              logs={jobLogsLoading ? 'Streaming playbook execution...' : jobLogsData?.logs || 'No logs available.'} 
              title={`Ansible Execution: ${selectedJob.playbook_name || 'Playbook'} (Job #${selectedJob.id})`}
              isStreaming={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnsibleIntegration;
