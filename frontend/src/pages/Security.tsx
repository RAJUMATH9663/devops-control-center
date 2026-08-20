import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  getSastMetrics, getImageScans, getVaultSecrets, triggerScan 
} from '../services/security';
import { testMaskSecrets, getSecretView } from '../services/secrets';
import { 
  ShieldCheck, ShieldAlert, Code2, Box, Key, Play, AlertCircle, 
  Lock, Eye, Wand2, CheckCircle2, Shield
} from 'lucide-react';

const SecurityIntegration = () => {
  const [activeTab, setActiveTab] = useState<'sast' | 'container' | 'secrets' | 'sandbox'>('sast');
  const [selectedSecretPath, setSelectedSecretPath] = useState<string | null>(null);
  const [sandboxInput, setSandboxInput] = useState('DATABASE_URL=postgresql://admin:superSecretPass123@db.prod:5432/app\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nGITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwx');
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isMasking, setIsMasking] = useState(false);

  const { data: sast, isLoading: sastLoading } = useQuery(['sec-sast'], getSastMetrics, { enabled: activeTab === 'sast' });
  const { data: images, isLoading: imagesLoading } = useQuery(['sec-images'], getImageScans, { enabled: activeTab === 'container' });
  const { data: secrets, isLoading: secretsLoading } = useQuery(['sec-secrets'], getVaultSecrets, { enabled: activeTab === 'secrets' });

  const { data: secretDetail, isLoading: detailLoading } = useQuery(
    ['sec-detail', selectedSecretPath],
    () => getSecretView(selectedSecretPath!),
    { enabled: !!selectedSecretPath }
  );

  const scanMutation = useMutation((target: string) => triggerScan(target), {
    onSuccess: () => alert('Scan triggered successfully.')
  });

  const handleTestMasking = async () => {
    try {
      setIsMasking(true);
      const res = await testMaskSecrets(sandboxInput);
      setSandboxOutput(res.masked);
    } catch (e) {
      console.error('Masking failed', e);
    } finally {
      setIsMasking(false);
    }
  };

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
            DevSecOps & Vault Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Unified code quality, container security, and HashiCorp Vault secrets management.
          </p>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('sast')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'sast' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Code2 className="w-4 h-4 mr-2" /> Static Analysis (SonarQube)
        </button>
        <button 
          onClick={() => setActiveTab('container')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'container' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Box className="w-4 h-4 mr-2" /> Container Scans (Trivy)
        </button>
        <button 
          onClick={() => setActiveTab('secrets')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'secrets' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Key className="w-4 h-4 mr-2" /> Secrets (HashiCorp Vault)
        </button>
        <button 
          onClick={() => setActiveTab('sandbox')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'sandbox' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Shield className="w-4 h-4 mr-2" /> Secret Masking Sandbox
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
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
                    <div className="text-xs text-slate-500 font-normal mt-1">Scanned: {new Date(img.last_scan).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {img.status === 'PASSED' ? 
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center justify-center w-max mx-auto"><CheckCircle2 className="w-3 h-3 mr-1"/> Passed</span> 
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
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-base">HashiCorp Vault Secret Leases</h3>
                <p className="text-xs text-slate-500 mt-0.5">Secure KV v2 secrets with automatic masking</p>
              </div>
            </div>

            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
              <thead className="bg-slate-50 dark:bg-slate-900/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Secret Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engine</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {secretsLoading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : secrets?.map((sec) => (
                  <tr key={sec.path} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center font-mono">
                      <Lock className="w-4 h-4 mr-2 text-indigo-500" />
                      {sec.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">{sec.engine}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-mono">
                      v{sec.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button 
                        onClick={() => setSelectedSecretPath(sec.path)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Inspect Keys
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Secret Inspect Drawer */}
            {selectedSecretPath && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-dark-border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-sm flex items-center font-mono">
                    <Key className="w-4 h-4 mr-2 text-indigo-500" />
                    Vault Path: {selectedSecretPath}
                  </h4>
                  <button onClick={() => setSelectedSecretPath(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                </div>
                {detailLoading ? (
                  <div className="text-xs text-slate-500">Fetching secret schema...</div>
                ) : secretDetail ? (
                  <div className="space-y-2">
                    {secretDetail.keys.map((k) => (
                      <div key={k} className="flex justify-between items-center text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">{k}:</span>
                        <span className="text-slate-900 dark:text-slate-200 font-semibold">{secretDetail.masked_data[k]}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* SECRET MASKING SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="p-6 space-y-6 max-w-4xl">
            <div>
              <h3 className="font-semibold text-base">Real-time Secret Masking Sandbox</h3>
              <p className="text-xs text-slate-500 mt-1">
                Test the automated log sanitization engine. Sensitive tokens, passwords, AWS keys, and webhooks are automatically redacted before log streaming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Raw Log / Configuration Input:
                </label>
                <textarea
                  rows={8}
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sanitized & Masked Output:
                </label>
                <div className="w-full h-44 p-3 font-mono text-xs border border-slate-300 dark:border-dark-border rounded-lg bg-slate-950 text-emerald-400 overflow-y-auto whitespace-pre-wrap">
                  {sandboxOutput || 'Click "Run Secret Masking Filter" to test...'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestMasking}
              disabled={isMasking}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isMasking ? 'Sanitizing...' : 'Run Secret Masking Filter'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default SecurityIntegration;
