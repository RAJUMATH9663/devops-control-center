import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getProfile, updateProfile, changePassword } from '../services/profile';
import { 
  Settings as SettingsIcon, Key, Users, History, Bell, 
  Send, CheckCircle2, AlertCircle, Loader2, User as UserIcon, Lock
} from 'lucide-react';

const SettingsIntegration = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens' | 'notifications' | 'team' | 'audit'>('profile');
  
  // Profile State
  const { data: profile, refetch: refetchProfile } = useQuery(['user-profile'], getProfile);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification Test State
  const [channelType, setChannelType] = useState('slack');
  const [targetUrl, setTargetUrl] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile({ full_name: fullName || profile?.full_name, email: email || profile?.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      refetchProfile();
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.response?.data?.detail || 'Current password incorrect.' });
    }
  };

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
            System & Account Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure your personal profile, security credentials, integration tokens, and alert channels.
          </p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm min-h-[550px] overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-dark-border p-4 space-y-1 bg-slate-50 dark:bg-slate-900/30">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4 mr-3" /> Profile & Security
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4 mr-3" /> Integration Tokens
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
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium border-b border-slate-200 dark:border-dark-border pb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-brand-500" />
                  User Profile Information
                </h3>
                <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
                  {profileMsg && (
                    <div className={`p-3 rounded-md text-xs flex items-center ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                      {profileMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={profile?.full_name || 'Administrator'} 
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={profile?.email || 'admin@devops.io'} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600">
                    Save Profile Changes
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-medium border-b border-slate-200 dark:border-dark-border pb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-500" />
                  Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                  {pwdMsg && (
                    <div className={`p-3 rounded-md text-xs flex items-center ${pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                      {pwdMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

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
                    <option value="email">Email Alert (SMTP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {channelType === 'email' ? 'Recipient Email Address' : 'Webhook Endpoint URL'}
                  </label>
                  <input
                    type="text"
                    placeholder={channelType === 'email' ? 'alerts@devops.io' : 'https://hooks.slack.com/services/...'}
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md bg-white dark:bg-slate-900 text-sm font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSendTestNotification}
                    disabled={isSending}
                    className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Dispatching Alert...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Notification
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-4 rounded-md border text-sm flex items-start space-x-3 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{testResult.success ? 'Dispatch Successful' : 'Dispatch Failed'}</div>
                      <div className="mt-0.5 text-xs opacity-90">{testResult.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Team Members</h3>
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-sm">Administrator</div>
                      <div className="text-xs text-slate-500">admin@devops.io</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-semibold rounded-full">
                    Admin
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                      D
                    </div>
                    <div>
                      <div className="font-medium text-sm">DevOps Engineer</div>
                      <div className="text-xs text-slate-500">devops@devops.io</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold rounded-full">
                    DevOps
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h3 className="text-lg font-medium mb-6 border-b border-slate-200 dark:border-dark-border pb-4">Security Audit Trail</h3>
              <div className="space-y-3 font-mono text-xs max-w-3xl">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-dark-border flex justify-between">
                  <span className="text-emerald-600 font-semibold">[AUTH_LOGIN]</span>
                  <span className="text-slate-600 dark:text-slate-400">admin@devops.io logged in from 10.0.1.15</span>
                  <span className="text-slate-400">Just now</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-dark-border flex justify-between">
                  <span className="text-purple-600 font-semibold">[VAULT_ACCESS]</span>
                  <span className="text-slate-600 dark:text-slate-400">Secret /production/database read</span>
                  <span className="text-slate-400">5m ago</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-dark-border flex justify-between">
                  <span className="text-blue-600 font-semibold">[K8S_SCALE]</span>
                  <span className="text-slate-600 dark:text-slate-400">Deployment devops-backend scaled to 4 replicas</span>
                  <span className="text-slate-400">12m ago</span>
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
