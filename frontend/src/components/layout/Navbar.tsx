import { useState } from 'react';
import { Bell, Search, UserCircle, Sun, Moon, X } from 'lucide-react';

const Navbar = ({ toggleTheme, isDark }: { toggleTheme: () => void, isDark: boolean }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, type: "alert", message: "High CPU usage on prod-db-1", time: "5m ago" },
    { id: 2, type: "success", message: "Deployment backend-api successful", time: "1h ago" },
    { id: 3, type: "info", "message": "New security scan available for devops/frontend", time: "2h ago" },
  ];

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border shadow-sm relative z-50">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-border rounded-md leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
            placeholder="Global search projects, pods, pipelines..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-card"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-md shadow-lg py-1 border border-slate-200 dark:border-dark-border">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-border flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4"/></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center text-sm text-brand-600 hover:text-brand-700 cursor-pointer">
                View all activity
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
          <UserCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
