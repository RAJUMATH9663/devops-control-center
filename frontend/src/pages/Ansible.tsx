import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getInventories, getPlaybooks, getJobs, executePlaybook
} from '../services/ansible';
import type { AnsiblePlaybook } from '../services/ansible';
import { 
  Terminal, Play, ListTree, Database, 
  Clock, Loader2
} from 'lucide-react';

const AnsibleIntegration = () => {
  const queryClient = useQueryClient();
  const [selectedPlaybook, setSelectedPlaybook] = useState<AnsiblePlaybook | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<number | null>(null);

  const { data: inventories, isLoading: inventoriesLoading } = useQuery(['ansible-inventories'], getInventories);
  const { data: playbooks, isLoading: playbooksLoading } = useQuery(['ansible-playbooks'], getPlaybooks);
  const { data: jobs, isLoading: jobsLoading } = useQuery(['ansible-jobs'], getJobs);

  const executeMutation = useMutation(
    ({ playbookId, inventoryId }: { playbookId: number, inventoryId: number }) => executePlaybook(playbookId, inventoryId), 
    {
      onSuccess: () => queryClient.invalidateQueries(['ansible-jobs'])
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Terminal className="w-6 h-6 mr-3 text-red-600" />
            Ansible Automation
          </h1>
          <p className="text-slate-500 mt-1">Execute playbooks against your dynamic inventories.</p>
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
                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{pb.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{pb.description}</div>
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
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{inv.hosts} hosts</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Source: {inv.source}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Pane: Execution & Jobs */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Execution Engine</h2>
              <p className="text-sm text-slate-500 mt-1">Ready to run Ansible modules.</p>
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
              <Clock className="w-5 h-5 mr-2 text-slate-400" /> Recent Jobs
            </h3>
            
            <div className="space-y-4">
              {jobsLoading ? (
                <div className="text-sm text-slate-500">Fetching jobs...</div>
              ) : jobs?.length === 0 ? (
                <div className="text-sm text-slate-500 p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No jobs executed yet. Select a playbook and inventory to begin.</div>
              ) : jobs?.map((job) => (
                <div key={job.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Terminal className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Playbook Execution</div>
                      <div className="text-xs text-slate-500 mt-1">Job ID: {job.id} • {new Date(job.started_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex items-center">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnsibleIntegration;
