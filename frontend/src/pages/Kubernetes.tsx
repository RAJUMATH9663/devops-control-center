import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNamespaces, getDeployments, getPods, getServices, 
  scaleDeployment, restartPod
} from '../services/kubernetes';
import type { K8sDeployment } from '../services/kubernetes';
import { 
  Server, Box, Layers, RotateCw, Network, 
  Settings2, Terminal, FolderKanban
} from 'lucide-react';

const KubernetesIntegration = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'namespaces' | 'deployments' | 'pods' | 'services'>('deployments');

  const { data: namespaces, isLoading: namespacesLoading } = useQuery(['k8s-namespaces'], getNamespaces, { enabled: activeTab === 'namespaces' });
  const { data: deployments, isLoading: deploymentsLoading } = useQuery(['k8s-deployments'], getDeployments, { enabled: activeTab === 'deployments' });
  const { data: pods, isLoading: podsLoading } = useQuery(['k8s-pods'], getPods, { enabled: activeTab === 'pods' });
  const { data: services, isLoading: servicesLoading } = useQuery(['k8s-services'], getServices, { enabled: activeTab === 'services' });

  const scaleMutation = useMutation(
    ({ name, replicas }: { name: string, replicas: number }) => scaleDeployment(name, replicas),
    { onSuccess: () => queryClient.invalidateQueries(['k8s-deployments']) }
  );

  const restartMutation = useMutation((name: string) => restartPod(name), {
    onSuccess: () => queryClient.invalidateQueries(['k8s-pods'])
  });

  const handleScale = (deployment: K8sDeployment) => {
    const currentReplicas = parseInt(deployment.ready.split('/')[1] || '0');
    const newReplicas = prompt(`Enter new replica count for ${deployment.name}:`, currentReplicas.toString());
    if (newReplicas !== null && !isNaN(parseInt(newReplicas))) {
      scaleMutation.mutate({ name: deployment.name, replicas: parseInt(newReplicas) });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Server className="w-6 h-6 mr-3 text-blue-600" />
            Kubernetes Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage clusters, workloads, and services in real-time.</p>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('namespaces')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'namespaces' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FolderKanban className="w-4 h-4 mr-2" /> Namespaces
        </button>
        <button 
          onClick={() => setActiveTab('deployments')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'deployments' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Layers className="w-4 h-4 mr-2" /> Deployments
        </button>
        <button 
          onClick={() => setActiveTab('pods')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'pods' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Box className="w-4 h-4 mr-2" /> Pods
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'services' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Network className="w-4 h-4 mr-2" /> Services
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{ns.status}</td>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Namespace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ready</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {deploymentsLoading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : deployments?.map((dep) => (
                <tr key={dep.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{dep.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{dep.namespace}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{dep.ready}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button onClick={() => handleScale(dep)} className="text-slate-400 hover:text-brand-500" title="Scale"><Settings2 className="w-5 h-5 ml-auto" /></button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ready</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Restarts</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {podsLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : pods?.map((pod) => (
                <tr key={pod.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{pod.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pod.ready}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{pod.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{pod.restarts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-3">
                    <button className="text-slate-400 hover:text-blue-500" title="Logs"><Terminal className="w-5 h-5 inline" /></button>
                    <button onClick={() => restartMutation.mutate(pod.name)} className="text-slate-400 hover:text-red-500" title="Delete/Restart"><RotateCw className="w-5 h-5 inline" /></button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cluster IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">External IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {servicesLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : services?.map((svc) => (
                <tr key={svc.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{svc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{svc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{svc.cluster_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{svc.external_ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{svc.ports}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KubernetesIntegration;
