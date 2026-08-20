import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  getSastMetrics, getImageScans, getVaultSecrets, triggerScan 
} from '../services/security';
import { 
  ShieldCheck, ShieldAlert, Code2, Box, Key, Play, AlertCircle 
} from 'lucide-react';

const SecurityIntegration = () => {
  const [activeTab, setActiveTab] = useState<'sast' | 'container' | 'secrets'>('sast');

  const { data: sast, isLoading: sastLoading } = useQuery(['sec-sast'], getSastMetrics, { enabled: activeTab === 'sast' });
  const { data: images, isLoading: imagesLoading } = useQuery(['sec-images'], getImageScans, { enabled: activeTab === 'container' });
  const { data: secrets, isLoading: secretsLoading } = useQuery(['sec-secrets'], getVaultSecrets, { enabled: activeTab === 'secrets' });

  const scanMutation = useMutation((target: string) => triggerScan(target), {
    onSuccess: () => alert('Scan triggered successfully.')
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'B': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <ShieldCheck className="w-6 h-6 mr-3 text-indigo-500" />
            DevSecOps Center
          </h1>
          <p className="text-slate-500 mt-1">Unified code quality, container security, and secrets management.</p>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('sast')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'sast' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Code2 className="w-4 h-4 mr-2" /> Static Analysis (SonarQube)
        </button>
        <button 
          onClick={() => setActiveTab('container')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'container' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Box className="w-4 h-4 mr-2" /> Container Scans (Trivy)
        </button>
        <button 
          onClick={() => setActiveTab('secrets')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'secrets' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Key className="w-4 h-4 mr-2" /> Secrets (Vault)
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex-1">
        
        {/* SAST (SonarQube) */}
        {activeTab === 'sast' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Quality Gate</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Bugs</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Vulnerabilities</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Coverage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {sastLoading ? <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr> : sast?.map((item) => (
                <tr key={item.project} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    <div>{item.project}</div>
                    <div className="text-xs text-slate-500 font-normal mt-1">Last Scan: {new Date(item.last_scan).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded border font-bold ${getGradeColor(item.grade)}`}>
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {item.bugs > 0 ? <span className="text-red-500">{item.bugs}</span> : <span className="text-slate-500">0</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {item.vulnerabilities > 0 ? <span className="text-red-500 flex items-center justify-center"><ShieldAlert className="w-4 h-4 mr-1"/>{item.vulnerabilities}</span> : <span className="text-slate-500">0</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                    {item.coverage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => scanMutation.mutate(item.project)} className="text-slate-400 hover:text-indigo-500" title="Run Scan"><Play className="w-5 h-5 ml-auto" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* CONTAINER SCANS (Trivy) */}
        {activeTab === 'container' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Docker Image</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Critical</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">High</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {imagesLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : images?.map((img) => (
                <tr key={img.image} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    <div>{img.image}</div>
                    <div className="text-xs text-slate-500 font-normal mt-1">Last Scan: {new Date(img.last_scan).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {img.status === 'Passed' 
                      ? <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Passed</span>
                      : <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center justify-center w-max mx-auto"><AlertCircle className="w-3 h-3 mr-1"/> Failed</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {img.critical > 0 ? <span className="text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{img.critical}</span> : <span className="text-slate-400">0</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {img.high > 0 ? <span className="text-orange-500">{img.high}</span> : <span className="text-slate-400">0</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => scanMutation.mutate(img.image)} className="text-slate-400 hover:text-indigo-500" title="Run Scan"><Play className="w-5 h-5 ml-auto" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* SECRETS (Vault) */}
        {activeTab === 'secrets' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Secret Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engine</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {secretsLoading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : secrets?.map((sec) => (
                <tr key={sec.path} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
                    <Key className="w-4 h-4 mr-2 text-slate-400" />
                    {sec.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{sec.engine}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-mono">
                    v{sec.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                    {new Date(sec.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SecurityIntegration;
