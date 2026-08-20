import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNamespaces, getDeployments, getPods, getServices, 
  scaleDeployment, restartPod, getPodLogs
} from '../services/kubernetes';
import type { K8sDeployment, K8sPod } from '../services/kubernetes';
import { LogTerminal } from '../components/common/LogTerminal';
import { 
  Server, Box, Layers, RotateCw, Network, 
  Terminal, FolderKanban, Plus, Minus, X
} from 'lucide-react';

const KubernetesIntegration = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'namespaces' | 'deployments' | 'pods' | 'services'>('deployments');
  const [selectedPod, setSelectedPod] = useState<K8sPod | null>(null);

  const { data: namespaces, isLoading: namespacesLoading } = useQuery(['k8s-namespaces'], getNamespaces, { enabled: activeTab === 'namespaces' });
  const { data: deployments, isLoading: deploymentsLoading } = useQuery(['k8s-deployments'], () => getDeployments(), { enabled: activeTab === 'deployments' });
  const { data: pods, isLoading: podsLoading } = useQuery(['k8s-pods'], () => getPods(), { enabled: activeTab === 'pods' });
  const { data: services, isLoading: servicesLoading } = useQuery(['k8s-services'], getServices, { enabled: activeTab === 'services' });

  const { data: podLogData, isLoading: podLogsLoading } = useQuery(
    ['k8s-pod-logs', selectedPod?.name],
    () => getPodLogs(selectedPod!.name, selectedPod!.namespace),
    { enabled: !!selectedPod }
  );

  const scaleMutation = useMutation(
    ({ name, replicas }: { name: string, replicas: number }) => scaleDeployment(name, replicas),
    { onSuccess: () => queryClient.invalidateQueries(['k8s-deployments']) }
  );

  const restartMutation = useMutation((name: string) => restartPod(name), {
    onSuccess: () => queryClient.invalidateQueries(['k8s-pods'])
  });

  const handleScaleDelta = (dep: K8sDeployment, delta: number) => {
    const current = typeof dep.available === 'number' ? dep.available : parseInt(String(dep.ready || '1/1').split('/')[0] || '1');
    const target = Math.max(0, current + delta);
    scaleMutation.mutate({ name: dep.name, replicas: target });
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Server className="w-6 h-6 mr-3 text-blue-600" />
            Kubernetes Cluster Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage clusters, workloads, replica scaling, and pod logs in real-time.
          </p>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('namespaces')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'namespaces' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FolderKanban className="w-4 h-4 mr-2" /> Namespaces
        </button>
        <button 
          onClick={() => setActiveTab('deployments')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'deployments' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Layers className="w-4 h-4 mr-2" /> Deployments & Workloads
        </button>
        <button 
          onClick={() => setActiveTab('pods')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'pods' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Box className="w-4 h-4 mr-2" /> Pods & Containers
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'services' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Network className="w-4 h-4 mr-2" /> Services & Ingress
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex-1">
        
        {/* NAMESPACES */}
        {activeTab === 'namespaces' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {namespacesLoading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> : namespaces?.map((ns) => (
                <tr key={ns.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{ns.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-500 font-medium">{ns.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{ns.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* DEPLOYMENTS */}
        {activeTab === 'deployments' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deployment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Namespace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Replicas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Scale Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {deploymentsLoading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : deployments?.map((dep) => (
                <tr key={dep.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    <div>{dep.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{dep.image || 'devops-image'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 font-mono">{dep.namespace}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {dep.available !== undefined ? `${dep.available} Pods Ready` : dep.ready}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleScaleDelta(dep, -1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        title="Scale Down (-1)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-xs font-bold w-6 text-center">
                        {dep.available !== undefined ? dep.available : '2'}
                      </span>
                      <button
                        onClick={() => handleScaleDelta(dep, 1)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        title="Scale Up (+1)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PODS */}
        {activeTab === 'pods' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pod Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Restarts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {podsLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : pods?.map((pod) => (
                <tr key={pod.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                    {pod.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {pod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pod.restarts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pod.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-3">
                    <button 
                      onClick={() => setSelectedPod(pod)}
                      className="text-slate-400 hover:text-blue-500" 
                      title="View Pod Logs"
                    >
                      <Terminal className="w-5 h-5 inline" />
                    </button>
                    <button 
                      onClick={() => restartMutation.mutate(pod.name)} 
                      className="text-slate-400 hover:text-red-500" 
                      title="Rolling Restart Pod"
                    >
                      <RotateCw className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cluster IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">External IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {servicesLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : services?.map((svc) => (
                <tr key={svc.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">{svc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{svc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{svc.cluster_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{svc.external_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{svc.ports}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pod Logs Modal */}
      {selectedPod && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg p-6">
          <div className="w-full h-full max-w-5xl rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
            <button 
              onClick={() => setSelectedPod(null)} 
              className="absolute top-2.5 right-3 z-30 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
            <LogTerminal 
              logs={podLogsLoading ? 'Fetching pod log stream from cluster...' : podLogData?.logs || 'No logs available.'} 
              title={`Pod: ${selectedPod.name} (${selectedPod.namespace})`}
              isStreaming={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesIntegration;
