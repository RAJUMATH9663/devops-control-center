import { useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Key, Users, History, Bell, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const SettingsIntegration = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'notifications' | 'team' | 'audit'>('tokens');
  
  // Notification Test State
  const [channelType, setChannelType] = useState('slack');
  const [targetUrl, setTargetUrl] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendTestNotification = async () => {
    if (!targetUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a webhook URL or destination.' });
      return;
    }
    try {
      setIsSending(true);
      setTestResult(null);
      const res = await api.post('/notifications/test', {
        channel_type: channelType,
        target: targetUrl,
        title: 'DevOps Control Center Health Check',
        message: 'Notification test triggered from settings panel. Alert system operational!',
        severity: 'success',
      });
      if (res.data.status === 'delivered') {
        setTestResult({ success: true, message: `Notification dispatched successfully to ${channelType}.` });
      } else {
        setTestResult({ success: false, message: 'Failed to deliver notification. Check webhook URL.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.detail || 'Error sending notification.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <SettingsIcon className="w-6 h-6 mr-3 text-brand-500" />
            System & Integration Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global platform integrations, alert webhooks, and access controls.</p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm min-h-[500px] overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-dark-border p-4 space-y-1 bg-slate-50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4 mr-3" /> Access Tokens
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 mr-3" /> Notifications & Alerts
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 mr-3" /> Team Management
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4 mr-3" /> Audit Logs
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'tokens' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Integration Tokens</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Personal Access Token (PAT)</label>
                  <div className="flex space-x-3">
                    <input type="password" value="ghp_••••••••••••••••••••••••••••" readOnly className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-slate-50 dark:bg-slate-900 text-sm font-mono" />
                    <button className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Update</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenkins API Token</label>
                  <div className="flex space-x-3">
                    <input type="password" value="11a••••••••••••••••••••••••" readOnly className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-slate-50 dark:bg-slate-900 text-sm font-mono" />
                    <button className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Update</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Docker Registry Token</label>
                  <div className="flex space-x-3">
                    <input type="password" placeholder="dckr_pat_••••••••••••••••" className="flex-1 px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm font-mono" />
                    <button className="px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Webhook & Alert Dispatcher</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notification Channel</label>
                  <select
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                  >
                    <option value="slack">Slack Incoming Webhook</option>
                    <option value="discord">Discord Webhook</option>
                    <option value="email">Email Alert Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {channelType === 'email' ? 'Destination Email Address' : 'Webhook URL'}
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={
                      channelType === 'slack'
                        ? 'https://hooks.slack.com/services/...'
                        : channelType === 'discord'
                        ? 'https://discord.com/api/webhooks/...'
                        : 'alerts@devops.io'
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-4">
                  <button
                    onClick={handleSendTestNotification}
                    disabled={isSending}
                    className="flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Test Alert
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-4 rounded-lg text-sm flex items-center ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                    )}
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Team & RBAC Roles</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">System Administrator</div>
                    <div className="text-xs text-slate-500">admin@devops.io</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    Admin Role
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">DevOps Lead</div>
                    <div className="text-xs text-slate-500">devops@devops.io</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    DevOps Role
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">System Audit Trail</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-dark-border">
                  <span className="text-slate-400">[2026-08-20 13:28:29 UTC]</span> <span className="text-emerald-500 font-bold">AUTH</span> User admin@devops.io generated access token.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-dark-border">
                  <span className="text-slate-400">[2026-08-20 12:46:00 UTC]</span> <span className="text-blue-500 font-bold">SYSTEM</span> Database migration 0001_initial_schema executed successfully.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsIntegration;
