import api from './api';

export interface LogAnalysisResponse {
  status: string;
  summary: string;
  root_cause: string;
  severity: string;
  suggested_fixes: string[];
  fix_commands: string[];
  confidence: string;
}

export interface AIRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  severity: 'low' | 'medium' | 'high';
  action: string;
}

export const analyzeLogsWithAI = async (logText: string, context?: string): Promise<LogAnalysisResponse> => {
  const response = await api.post<LogAnalysisResponse>('/ai/analyze-logs', {
    log_text: logText,
    context: context || 'general',
  });
  return response.data;
};

export const getAIRecommendations = async (): Promise<AIRecommendation[]> => {
  const response = await api.get<AIRecommendation[]>('/ai/recommendations');
  return response.data;
};
