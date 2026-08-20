import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getContainers, getImages, getVolumes, getNetworks, 
  restartContainer, deleteImage, getContainerLogs
} from '../services/docker';
import type { DockerContainer } from '../services/docker';
import { 
  Container, Play, Square, RotateCw, Trash2, 
  Box, HardDrive, Network, TerminalSquare, X
} from 'lucide-react';

const DockerIntegration = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'volumes' | 'networks'>('containers');
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<DockerContainer | null>(null);

  const { data: containers, isLoading: containersLoading } = useQuery(['docker-containers'], getContainers);
  const { data: images, isLoading: imagesLoading } = useQuery(['docker-images'], getImages, { enabled: activeTab === 'images' });
  const { data: volumes, isLoading: volumesLoading } = useQuery(['docker-volumes'], getVolumes, { enabled: activeTab === 'volumes' });
  const { data: networks, isLoading: networksLoading } = useQuery(['docker-networks'], getNetworks, { enabled: activeTab === 'networks' });

  const { data: logData, isLoading: logsLoading } = useQuery(
    ['docker-logs', selectedContainer?.id],
    () => getContainerLogs(selectedContainer!.id),
    { enabled: logsModalOpen && !!selectedContainer }
  );

  const restartMutation = useMutation((id: string) => restartContainer(id), {
    onSuccess: () => queryClient.invalidateQueries(['docker-containers'])
  });

  const deleteImageMutation = useMutation((id: string) => deleteImage(id), {
    onSuccess: () => queryClient.invalidateQueries(['docker-images'])
  });

  const openLogs = (container: DockerContainer) => {
    setSelectedContainer(container);
    setLogsModalOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Container className="w-6 h-6 mr-3 text-blue-500" />
            Advanced Docker Management
          </h1>
          <p className="text-slate-500 mt-1">Manage containers, images, volumes, and networks across your hosts.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium rounded-md shadow-sm">
          Deploy Container
        </button>
      </div>

      <div className="flex space-x-6 border-b border-slate-200 dark:border-dark-border">
        <button 
          onClick={() => setActiveTab('containers')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'containers' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Box className="w-4 h-4 mr-2" /> Containers
        </button>
        <button 
          onClick={() => setActiveTab('images')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'images' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Container className="w-4 h-4 mr-2" /> Images
        </button>
        <button 
          onClick={() => setActiveTab('volumes')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'volumes' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <HardDrive className="w-4 h-4 mr-2" /> Volumes
        </button>
        <button 
          onClick={() => setActiveTab('networks')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'networks' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Network className="w-4 h-4 mr-2" /> Networks
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex-1">
        
        {/* CONTAINERS */}
        {activeTab === 'containers' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ports</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {containersLoading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : containers?.map((container) => (
                <tr key={container.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{container.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{container.image}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${container.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {container.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{container.ports}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end space-x-3">
                      <button onClick={() => openLogs(container)} className="text-slate-400 hover:text-brand-500" title="Logs"><TerminalSquare className="w-5 h-5" /></button>
                      <button onClick={() => restartMutation.mutate(container.id)} className="text-slate-400 hover:text-blue-500" title="Restart"><RotateCw className="w-5 h-5" /></button>
                      {container.status === 'running' ? (
                        <button className="text-slate-400 hover:text-red-500" title="Stop"><Square className="w-5 h-5" /></button>
                      ) : (
                        <button className="text-slate-400 hover:text-green-500" title="Start"><Play className="w-5 h-5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* IMAGES */}
        {activeTab === 'images' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Repository</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {imagesLoading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : images?.map((image) => (
                <tr key={image.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{image.repository}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">{image.tag}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{image.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button onClick={() => deleteImageMutation.mutate(image.id)} className="text-slate-400 hover:text-red-500" title="Delete"><Trash2 className="w-5 h-5 ml-auto" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* VOLUMES */}
        {activeTab === 'volumes' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {volumesLoading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> : volumes?.map((volume) => (
                <tr key={volume.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{volume.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{volume.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {volume.in_use ? <span className="text-green-500 font-medium">In Use</span> : <span className="text-slate-400">Unused</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* NETWORKS */}
        {activeTab === 'networks' && (
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {networksLoading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> : networks?.map((net) => (
                <tr key={net.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{net.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{net.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{net.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Logs Modal Overlay */}
      {logsModalOpen && selectedContainer && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
          <div className="bg-slate-900 w-3/4 h-3/4 rounded-lg shadow-2xl flex flex-col border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-white font-mono text-sm flex items-center">
                <TerminalSquare className="w-4 h-4 mr-2 text-slate-400" />
                {selectedContainer.name} logs
              </h3>
              <button onClick={() => setLogsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-green-400 font-mono text-xs whitespace-pre-wrap">
              {logsLoading ? 'Loading logs streaming output...' : logData?.logs}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DockerIntegration;
