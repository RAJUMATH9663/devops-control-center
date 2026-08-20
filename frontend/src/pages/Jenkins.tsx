import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJenkinsJobs, getJenkinsBuilds, triggerJenkinsBuild, 
  cancelJenkinsBuild, getJenkinsLogs 
} from '../services/jenkins';
import type { JenkinsJob } from '../services/jenkins';
import { analyzeLogsWithAI, type LogAnalysisResponse } from '../services/ai';
import { 
  TerminalSquare, Play, Clock, CheckCircle2, 
  XCircle, AlertCircle, Loader2, StopCircle, AlignLeft,
  Sparkles, Wrench, Terminal, Copy, Check
} from 'lucide-react';

const JenkinsIntegration = () => {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<JenkinsJob | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<LogAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: jobs, isLoading: jobsLoading } = useQuery(['jenkins-jobs'], getJenkinsJobs);

  const { data: builds, isLoading: buildsLoading } = useQuery(
    ['jenkins-builds', selectedJob?.name], 
    () => getJenkinsBuilds(selectedJob!.name),
    { enabled: !!selectedJob }
  );

  const { data: logData, isLoading: logsLoading } = useQuery(
    ['jenkins-logs', selectedJob?.name, selectedBuild],
    () => getJenkinsLogs(selectedJob!.name, selectedBuild!),
    { 
      enabled: !!selectedJob && !!selectedBuild,
      onSuccess: () => setAiAnalysis(null)
    }
  );

  const triggerMutation = useMutation((name: string) => triggerJenkinsBuild(name), {
    onSuccess: () => queryClient.invalidateQueries(['jenkins-builds', selectedJob?.name])
  });

  const cancelMutation = useMutation(
    ({ jobName, buildNum }: { jobName: string, buildNum: number }) => cancelJenkinsBuild(jobName, buildNum), 
    {
      onSuccess: () => queryClient.invalidateQueries(['jenkins-builds', selectedJob?.name])
    }
  );

  const handleAnalyzeWithAI = async () => {
    if (!logData?.logs) return;
    try {
      setIsAnalyzing(true);
      const res = await analyzeLogsWithAI(logData.logs, selectedJob?.name);
      setAiAnalysis(res);
    } catch (e) {
      console.error("AI log analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SUCCESS': return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">Success</span>;
      case 'FAILURE': return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">Failure</span>;
      case 'BUILDING': return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">Building</span>;
      case 'ABORTED': return <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs rounded-full font-medium">Aborted</span>;
      default: return <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs rounded-full font-medium">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <TerminalSquare className="w-6 h-6 mr-3 text-brand-500" />
            Advanced Jenkins Pipelines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor, trigger, cancel, and diagnose console logs with AI.</p>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-hidden">
        {/* Left Pane: Job List */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-medium">Pipeline Jobs</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {jobsLoading ? (
              <div className="text-sm text-slate-500 text-center py-4">Loading jobs...</div>
            ) : jobs?.map((job) => (
              <div 
                key={job.name} 
                onClick={() => { setSelectedJob(job); setSelectedBuild(null); setAiAnalysis(null); }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedJob?.name === job.name ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-slate-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-700'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{job.name}</div>
                  {job.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                   job.status === 'FAILURE' ? <XCircle className="w-5 h-5 text-red-500" /> : 
                   job.status === 'BUILDING' ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : 
                   <AlertCircle className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Build #{job.last_build_number}</span>
                  <span>{job.last_build_time ? new Date(job.last_build_time).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Build History & Logs */}
        <div className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {selectedJob ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedJob.name}</h2>
                  <a href={selectedJob.url} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline mt-1 inline-block">
                    View in Jenkins ↗
                  </a>
                </div>
                <button 
                  onClick={() => triggerMutation.mutate(selectedJob.name)}
                  disabled={triggerMutation.isLoading}
                  className="flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {triggerMutation.isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Trigger Build
                </button>
              </div>

              {selectedBuild ? (
                // Console Log & AI View
                <div className="p-6 flex-1 flex flex-col overflow-hidden space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <AlignLeft className="w-5 h-5 mr-2 text-slate-400" /> 
                      Console Output for Build #{selectedBuild}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzing || logsLoading}
                        className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                        Analyze with AI
                      </button>
                      <button 
                        onClick={() => { setSelectedBuild(null); setAiAnalysis(null); }}
                        className="text-sm text-brand-500 hover:underline"
                      >
                        &larr; Back to History
                      </button>
                    </div>
                  </div>

                  {/* AI Diagnosis Card if generated */}
                  {aiAnalysis && (
                    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
                            AI Failure Diagnosis: {aiAnalysis.summary}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          aiAnalysis.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                          aiAnalysis.severity === 'HIGH' ? 'bg-amber-200 text-amber-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {aiAnalysis.severity} ({aiAnalysis.confidence})
                        </span>
                      </div>
                      <p className="text-xs text-purple-800 dark:text-purple-300">
                        {aiAnalysis.root_cause}
                      </p>
                      {aiAnalysis.suggested_fixes.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center">
                            <Wrench className="w-3.5 h-3.5 mr-1" /> Remediation Steps:
                          </span>
                          <ul className="list-disc list-inside text-xs text-purple-700 dark:text-purple-300 space-y-0.5 pl-2">
                            {aiAnalysis.suggested_fixes.map((fix, idx) => (
                              <li key={idx}>{fix}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.fix_commands.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center">
                            <Terminal className="w-3.5 h-3.5 mr-1" /> Fix Commands:
                          </span>
                          <div className="space-y-1">
                            {aiAnalysis.fix_commands.map((cmd, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-900 text-green-400 px-3 py-1.5 rounded font-mono text-xs">
                                <span>{cmd}</span>
                                <button
                                  onClick={() => handleCopyCommand(cmd, idx)}
                                  className="text-slate-400 hover:text-white"
                                  title="Copy command"
                                >
                                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto whitespace-pre-wrap shadow-inner border border-slate-800">
                    {logsLoading ? 'Fetching logs...' : logData?.logs || 'No logs available.'}
                  </div>
                </div>
              ) : (
                // Build History Table
                <div className="p-6 flex-1 overflow-y-auto">
                  <h3 className="font-medium mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-slate-400" /> Build History
                  </h3>
                  
                  <div className="bg-white dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-dark-border overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
                      <thead className="bg-slate-50 dark:bg-slate-900/80">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Build</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                        {buildsLoading ? (
                          <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Fetching builds...</td></tr>
                        ) : builds?.map((build) => (
                          <tr key={build.build_number} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                              #{build.build_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(build.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {new Date(build.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-3">
                              {build.status === 'BUILDING' && (
                                <button 
                                  onClick={() => cancelMutation.mutate({ jobName: selectedJob.name, buildNum: build.build_number })}
                                  className="text-red-500 hover:text-red-700 font-medium"
                                  title="Cancel Build"
                                >
                                  <StopCircle className="w-5 h-5 inline" />
                                </button>
                              )}
                              <button 
                                onClick={() => setSelectedBuild(build.build_number)}
                                className="text-brand-500 hover:text-brand-700 font-medium"
                              >
                                View Logs
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <TerminalSquare className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p>Select a pipeline job to view history and trigger deployments.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JenkinsIntegration;
