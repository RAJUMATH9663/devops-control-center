import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import GitHubIntegration from './pages/GitHub';
import JenkinsIntegration from './pages/Jenkins';
import Deployments from './pages/Deployments';
import DockerIntegration from './pages/Docker';
import KubernetesIntegration from './pages/Kubernetes';
import TerraformIntegration from './pages/Terraform';
import AnsibleIntegration from './pages/Ansible';
import MonitoringIntegration from './pages/Monitoring';
import SecurityIntegration from './pages/Security';
import SettingsIntegration from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="deployments" element={<Deployments />} />
            <Route path="github" element={<GitHubIntegration />} />
            <Route path="jenkins" element={<JenkinsIntegration />} />
            <Route path="docker" element={<DockerIntegration />} />
            <Route path="kubernetes" element={<KubernetesIntegration />} />
            <Route path="terraform" element={<TerraformIntegration />} />
            <Route path="ansible" element={<AnsibleIntegration />} />
            <Route path="monitoring" element={<MonitoringIntegration />} />
            <Route path="security" element={<SecurityIntegration />} />
            <Route path="settings" element={<SettingsIntegration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
