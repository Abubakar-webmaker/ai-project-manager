// src/modules/ai/ai.types.ts
export interface AITaskGeneratorDTO {
  projectName: string;
  description: string;
  projectId: string;
  autoCreate?: boolean;
}

export interface AISprintPlannerDTO {
  projectId: string;
  teamSize: number;
  sprintDays: number;
  taskIds?: string[];
}

export interface AIPrioritySuggesterDTO {
  projectId: string;
  taskIds?: string[];
}

export interface AIProgressReportDTO {
  projectId: string;
}

export interface AIStandupGeneratorDTO {
  projectId: string;
}

export interface AIRiskAnalyzerDTO {
  projectId: string;
}

export interface AITaskEstimatorDTO {
  taskId: string;
}

export interface AICodeReviewDTO {
  code: string;
  language: string;
  taskId?: string;
}

export interface AIMeetingMinutesDTO {
  notes: string;
  projectId: string;
  autoCreate?: boolean;
}

export interface AIMoodAnalyzerDTO {
  projectId: string;
}

export interface AIDeadlinePredictorDTO {
  taskId: string;
}

export interface AIConflictDetectorDTO {
  projectId: string;
}

export interface AIClientReportDTO {
  projectId: string;
}

export interface AIResourceAllocatorDTO {
  projectId: string;
}

export interface AIScopeCreepDetectorDTO {
  projectId: string;
}