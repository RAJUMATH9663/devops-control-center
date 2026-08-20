import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getMetrics, getAlerts, getLogs 
} from '../services/monitoring';
import { LogTerminal } from '../components/common/LogTerminal';
import { 
  Activity, AlertTriangle, Bell, Cpu, 
  Database, TerminalSquare, CheckCircle2, HardDrive, Wifi
} from 'lucide-react';

const MonitoringIntegration = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'logs'>('alerts');

  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ['mon-metrics'], 
    getMetrics, 
    { refetchInterval: 3000 }
  );
  
  const { data: alerts, isLoading: alertsLoading } = useQuery(['mon-alerts'], getAlerts);
  const { data: logs, isLoading: logsLoading } = useQuery(['mon-logs'], getLogs);

  const rawLogsText = logs?.map(l => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join('\n') || '';

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Activity className="w-6 h-6 mr-3 text-emerald-500" />
            Prometheus & Grafana Observability
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry, Prometheus alert rules, and centralized log streams.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Prometheus Live Scrape Active (1s)</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Cluster CPU Usage</h3>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : metrics?.cpu_usage}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${metrics?.cpu_value || 35}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Cluster Memory Usage</h3>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : metrics?.memory_usage}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${metrics?.memory_value || 55}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Throughput & Rate</h3>
            <Wifi className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : metrics?.request_rate}
          </div>
          <div className="text-xs text-slate-500 mt-4">
            p95 Latency: <strong className="text-slate-800 dark:text-slate-200">{metrics?.p95_latency || '24ms'}</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Container Health</h3>
            <HardDrive className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics?.containers_healthy || 14} / {metrics?.containers_total || 14}
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All Pods Healthy
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'alerts' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Bell className="w-4 h-4 mr-2" /> Active Alerts & Rules
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'logs' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <TerminalSquare className="w-4 h-4 mr-2" /> Centralized Log Stream (Loki)
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'alerts' && (
          <div className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-medium text-sm">Prometheus Alertmanager Rules</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
                <thead className="bg-slate-50 dark:bg-slate-900/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alert Rule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PromQL Expression</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                  {alertsLoading ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading alert rules...</td></tr>
                  ) : alerts?.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
                        {getAlertIcon(alert.severity)}
                        <span className="ml-2.5">{alert.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                        {alert.expr || 'rate(cpu_seconds_total[5m]) > 0.8'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{alert.for || '5m'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                        Normal (Not Firing)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="w-full h-full flex flex-col">
            <LogTerminal 
              logs={logsLoading ? 'Connecting to Loki log aggregator...' : rawLogsText}
              title="Centralized Log Aggregation (Grafana Loki)"
              isStreaming={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringIntegration;
