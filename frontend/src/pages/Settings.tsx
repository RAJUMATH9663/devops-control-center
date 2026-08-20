import { Settings as SettingsIcon, Key, Users, History } from 'lucide-react';

const SettingsIntegration = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <SettingsIcon className="w-6 h-6 mr-3 text-slate-500" />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure global platform integrations and access.</p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm min-h-[500px]">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-dark-border">
          <nav className="p-4 space-y-1">
            <button className="w-full flex items-center px-3 py-2 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-500 rounded-md text-sm font-medium">
              <Key className="w-4 h-4 mr-3" /> Access Tokens
            </button>
            <button className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-sm font-medium">
              <Users className="w-4 h-4 mr-3" /> Team Management
            </button>
            <button className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-sm font-medium">
              <History className="w-4 h-4 mr-3" /> Audit Logs
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 p-8">
          <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Integration Tokens</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Personal Access Token (PAT)</label>
              <div className="flex space-x-3">
                <input type="password" value="••••••••••••••••" readOnly className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-slate-50 dark:bg-slate-900" />
                <button className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Update</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenkins API Token</label>
              <div className="flex space-x-3">
                <input type="password" value="••••••••••••••••" readOnly className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-slate-50 dark:bg-slate-900" />
                <button className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Update</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Docker Registry Credentials</label>
              <div className="flex space-x-3">
                <input type="password" placeholder="Enter Docker Hub Token" className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900" />
                <button className="px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsIntegration;
