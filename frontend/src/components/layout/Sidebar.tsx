import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  GitPullRequest as Github, 
  TerminalSquare,
  Container, 
  CloudRain, 
  Blocks, 
  BookMarked, 
  Activity, 
  ShieldAlert, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Projects', to: '/projects', icon: FolderGit2 },
    { name: 'GitHub', to: '/github', icon: Github },
    { name: 'Jenkins', to: '/jenkins', icon: TerminalSquare },
    { name: 'Docker', to: '/docker', icon: Container },
    { name: 'Kubernetes', to: '/kubernetes', icon: CloudRain },
    { name: 'Terraform', to: '/terraform', icon: Blocks },
    { name: 'Ansible', to: '/ansible', icon: BookMarked },
    { name: 'Monitoring', to: '/monitoring', icon: Activity },
    { name: 'Security', to: '/security', icon: ShieldAlert },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 font-bold text-xl text-white tracking-wide border-b border-slate-800">
        DevOps Center
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
