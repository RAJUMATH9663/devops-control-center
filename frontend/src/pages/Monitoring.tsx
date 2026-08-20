import { useQuery } from '@tanstack/react-query';
import { 
  getMetrics, getAlerts, getLogs
} from '../services/monitoring';
import { 
  Activity, AlertTriangle, Bell, Cpu, 
  Database, Server, TerminalSquare 
} from 'lucide-react';

const MonitoringIntegration = () => {
  // Use React Query refetchInterval to simulate real-time metrics updates
  const { data: metrics, isLoading: metricsLoading } = useQuery(['mon-metrics'], getMetrics, { refetchInterval: 5000 });
  const { data: alerts, isLoading: alertsLoading } = useQuery(['mon-alerts'], getAlerts);
  const { data: logs, isLoading: logsLoading } = useQuery(['mon-logs'], getLogs);

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch(level) {
      case 'ERROR': return <span className="text-red-500 font-bold">[{level}]</span>;
      case 'WARN': return <span className="text-yellow-500 font-bold">[{level}]</span>;
      case 'INFO': return <span className="text-blue-500 font-bold">[{level}]</span>;
      default: return <span className="text-slate-500 font-bold">[{level}]</span>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Activity className="w-6 h-6 mr-3 text-emerald-500" />
            Observability Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Unified view of Prometheus metrics, Alertmanager alerts, and Loki logs.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span>Live Data Feed Active</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">CPU Usage</h3>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : `${metrics?.cpu_usage}%`}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${metrics?.cpu_usage || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Memory Usage</h3>
            <Database className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : `${metrics?.memory_usage}%`}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${metrics?.memory_usage || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Active Connections</h3>
            <Server className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : metrics?.active_connections}
          </div>
          <div className="text-xs text-slate-500 mt-4">+12% from last hour</div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <h3 className="text-sm font-medium">Error Rate (5xx)</h3>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {metricsLoading ? '--' : `${metrics?.error_rate}%`}
          </div>
          <div className="text-xs text-slate-500 mt-4">Threshold: &lt; 1.0%</div>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Active Alerts */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Bell className="w-4 h-4 mr-2" /> Alertmanager
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {alerts?.filter(a => a.severity === 'critical').length || 0} Critical
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alertsLoading ? (
              <div className="text-sm text-slate-500 text-center py-4">Loading alerts...</div>
            ) : alerts?.map((alert) => (
              <div key={alert.id} className="p-4 border border-slate-200 dark:border-dark-border rounded-lg flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{alert.name}</h4>
                    <span className="text-xs text-slate-500">{alert.started_at}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Target: {alert.target}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Centralized Logs */}
        <div className="flex-1 bg-slate-950 rounded-lg shadow-sm overflow-hidden flex flex-col border border-slate-800">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <h3 className="font-medium text-slate-200 flex items-center">
              <TerminalSquare className="w-4 h-4 mr-2 text-slate-400" /> Log Aggregation (Loki)
            </h3>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="LogQL Query... e.g., {app='payment-api'}" 
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-1 w-64 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {logsLoading ? (
              <div className="text-slate-500">Connecting to log stream...</div>
            ) : logs?.map((log, index) => (
              <div key={index} className="mb-2 flex hover:bg-slate-800/50 rounded px-1 transition-colors">
                <span className="text-slate-500 w-44 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="w-20 shrink-0">{getLogLevelBadge(log.level)}</span>
                <span className="text-emerald-400 w-32 shrink-0">[{log.service}]</span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
            <div className="mt-4 flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              </span>
              <span className="text-slate-500 italic">Tailing logs...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringIntegration;
