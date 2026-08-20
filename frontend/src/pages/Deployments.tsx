import { useState, useEffect } from 'react';

export default function Deployments() {
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from the backend:
    // apiClient.get('/deployments').then(res => setDeployments(res.data)).catch(console.error);
    
    setDeployments([
      { id: 101, environment: 'production', status: 'success', timestamp: new Date().toISOString() },
      { id: 102, environment: 'staging', status: 'pending', timestamp: new Date().toISOString() },
      { id: 103, environment: 'dev', status: 'failed', timestamp: new Date().toISOString() }
    ]);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Deployments</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Environment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {deployments.map((dep) => (
              <tr key={dep.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">#{dep.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                    {dep.environment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    dep.status === 'success' ? 'bg-green-100 text-green-800' :
                    dep.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dep.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(dep.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
