import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Activity, Container, Database, FolderGit2, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // Mock Data
  const deploymentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Deployments',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 1,
      },
    ],
  };

  const systemData = {
    labels: ['CPU', 'Memory', 'Disk'],
    datasets: [
      {
        data: [65, 75, 40],
        backgroundColor: ['#f43f5e', '#3b82f6', '#eab308'],
        hoverBackgroundColor: ['#e11d48', '#2563eb', '#ca8a04'],
        borderWidth: 0,
      },
    ],
  };

  const stats = [
    { title: 'Total Projects', value: '12', icon: FolderGit2, color: 'text-blue-500' },
    { title: 'Active Deployments', value: '4', icon: Activity, color: 'text-brand-500' },
    { title: 'Running Pods', value: '128', icon: Container, color: 'text-purple-500' },
    { title: 'Database Size', value: '45 GB', icon: Database, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of your DevOps environment.</p>
        </div>
      </div>

      {/* DORA Metrics (Phase 14) */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-lg p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-300"/> Elite DORA Performer</h2>
          <p className="text-brand-100 text-sm mt-1">Your team is performing at the highest industry standards.</p>
        </div>
        <div className="flex space-x-8">
          <div className="text-center">
            <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Deployment Freq</p>
            <p className="text-2xl font-bold mt-1">12/day</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Lead Time</p>
            <p className="text-2xl font-bold mt-1">1.2h</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">MTTR</p>
            <p className="text-2xl font-bold mt-1">15m</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Change Failure</p>
            <p className="text-2xl font-bold mt-1">2.4%</p>
          </div>
        </div>
      </div>

      {/* AI Insights (Phase 14) */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-medium flex items-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5 mr-2" /> AI Infrastructure Insights
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50 p-4 rounded-lg">
            <div className="flex items-center text-yellow-700 dark:text-yellow-500 font-semibold mb-2">
              <Database className="w-4 h-4 mr-2" /> Cost Optimization
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">The staging-aws-infrastructure cluster has had &lt; 5% CPU utilization for 48 hours. Consider downscaling to save $120/mo.</p>
          </div>
          <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 p-4 rounded-lg">
            <div className="flex items-center text-red-700 dark:text-red-500 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 mr-2" /> Security Risk
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">devops/frontend:latest has a new CRITICAL CVE. I recommend triggering a rebuild with updated base images.</p>
          </div>
          <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/50 p-4 rounded-lg">
            <div className="flex items-center text-blue-700 dark:text-blue-500 font-semibold mb-2">
              <Activity className="w-4 h-4 mr-2" /> Performance Tuning
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Postgres CPU spikes correlating with missing indices on `audit_logs`. Running `CREATE INDEX` will improve load times by 40%.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-slate-50 dark:bg-slate-900 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Deployment History</h3>
          <div className="h-64">
            <Bar data={deploymentData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">System Resources</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={systemData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
