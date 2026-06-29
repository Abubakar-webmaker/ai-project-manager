// src/shared/constants/ai.prompts.ts
export const AI_PROMPTS = {
  TASK_GENERATOR: (projectName: string, description: string) => `
You are an expert project manager. Generate a comprehensive task list for the following project.

Project Name: ${projectName}
Project Description: ${description}

Return ONLY a JSON array of tasks. Each task must have:
{
  "title": "string",
  "description": "string",
  "priority": "low" | "medium" | "high" | "critical",
  "estimatedHours": number,
  "labels": ["string"],
  "subtasks": ["string"]
}

Generate 8-12 realistic, actionable tasks. Return ONLY valid JSON, no explanation.`,

  SPRINT_PLANNER: (
    tasks: any[],
    teamSize: number,
    sprintDays: number
  ) => `
You are an expert agile coach. Create a sprint plan from the following tasks.

Team Size: ${teamSize} developers
Sprint Duration: ${sprintDays} days
Available Tasks: ${JSON.stringify(tasks)}

Return ONLY a JSON object:
{
  "sprintGoal": "string",
  "selectedTasks": [{ "taskId": "string", "assignedDay": number, "reasoning": "string" }],
  "totalEstimatedHours": number,
  "risks": ["string"],
  "recommendations": ["string"]
}

Return ONLY valid JSON, no explanation.`,

  PRIORITY_SUGGESTER: (tasks: any[]) => `
You are an expert project manager. Analyze these tasks and suggest optimal priorities.

Tasks: ${JSON.stringify(tasks)}

Return ONLY a JSON array:
[{
  "taskId": "string",
  "suggestedPriority": "low" | "medium" | "high" | "critical",
  "reasoning": "string",
  "urgencyScore": number
}]

Return ONLY valid JSON, no explanation.`,

  PROGRESS_REPORT: (projectData: any) => `
You are a project reporting expert. Generate a professional progress report.

Project Data: ${JSON.stringify(projectData)}

Return ONLY a JSON object:
{
  "summary": "string",
  "accomplishments": ["string"],
  "inProgress": ["string"],
  "blockers": ["string"],
  "nextSteps": ["string"],
  "overallHealth": "on_track" | "at_risk" | "critical",
  "completionPercentage": number,
  "recommendation": "string"
}

Return ONLY valid JSON, no explanation.`,

  STANDUP_GENERATOR: (userTasks: any[], userName: string) => `
You are an agile coach. Generate a daily standup for ${userName}.

Their tasks: ${JSON.stringify(userTasks)}

Return ONLY a JSON object:
{
  "yesterday": ["string"],
  "today": ["string"],
  "blockers": ["string"],
  "formattedStandup": "string"
}

Return ONLY valid JSON, no explanation.`,

  RISK_ANALYZER: (projectData: any) => `
You are a risk management expert. Analyze this project for risks.

Project: ${JSON.stringify(projectData)}

Return ONLY a JSON array:
[{
  "risk": "string",
  "severity": "low" | "medium" | "high" | "critical",
  "probability": "low" | "medium" | "high",
  "impact": "string",
  "mitigation": "string"
}]

Return ONLY valid JSON, no explanation.`,

  TASK_ESTIMATOR: (taskData: any, historicalData: any) => `
You are an expert software estimation specialist.

Task: ${JSON.stringify(taskData)}
Historical Data: ${JSON.stringify(historicalData)}

Return ONLY a JSON object:
{
  "estimatedHours": number,
  "confidenceLevel": "low" | "medium" | "high",
  "breakdown": [{ "phase": "string", "hours": number }],
  "assumptions": ["string"],
  "risks": ["string"]
}

Return ONLY valid JSON, no explanation.`,

  CODE_REVIEWER: (code: string, language: string) => `
You are a senior software engineer. Review this ${language} code.

Code: ${code}

Return ONLY a JSON object:
{
  "overallScore": number,
  "issues": [{
    "type": "bug" | "security" | "performance" | "style" | "maintainability",
    "severity": "low" | "medium" | "high" | "critical",
    "description": "string",
    "suggestion": "string",
    "line": number | null
  }],
  "strengths": ["string"],
  "suggestions": ["string"],
  "summary": "string"
}

Return ONLY valid JSON, no explanation.`,

  MEETING_MINUTES: (notes: string) => `
You are an expert meeting facilitator. Extract action items from these meeting notes.

Meeting Notes: ${notes}

Return ONLY a JSON object:
{
  "meetingSummary": "string",
  "decisions": ["string"],
  "actionItems": [{
    "title": "string",
    "description": "string",
    "assignee": "string | null",
    "dueDate": "string | null",
    "priority": "low" | "medium" | "high" | "critical"
  }],
  "followUpTopics": ["string"]
}

Return ONLY valid JSON, no explanation.`,

  MOOD_ANALYZER: (comments: string[]) => `
You are an organizational psychologist. Analyze team sentiment from these comments.

Comments: ${JSON.stringify(comments)}

Return ONLY a JSON object:
{
  "overallMood": "positive" | "neutral" | "stressed" | "negative",
  "moodScore": number,
  "themes": ["string"],
  "alerts": ["string"],
  "recommendations": ["string"],
  "summary": "string"
}

Return ONLY valid JSON, no explanation.`,

  DEADLINE_PREDICTOR: (taskData: any, historicalData: any) => `
You are a project forecasting expert.

Current Task: ${JSON.stringify(taskData)}
Team Historical Performance: ${JSON.stringify(historicalData)}

Return ONLY a JSON object:
{
  "predictedCompletionDate": "ISO date string",
  "confidenceLevel": "low" | "medium" | "high",
  "originalDeadline": "string",
  "isAtRisk": boolean,
  "delayDays": number,
  "factors": ["string"],
  "recommendations": ["string"]
}

Return ONLY valid JSON, no explanation.`,

  CONFLICT_DETECTOR: (tasks: any[], members: any[]) => `
You are a resource management expert. Detect scheduling conflicts.

Tasks: ${JSON.stringify(tasks)}
Team Members: ${JSON.stringify(members)}

Return ONLY a JSON array:
[{
  "type": "overload" | "deadline_clash" | "skill_mismatch" | "dependency",
  "severity": "low" | "medium" | "high",
  "description": "string",
  "affectedTasks": ["string"],
  "affectedMembers": ["string"],
  "resolution": "string"
}]

Return ONLY valid JSON, no explanation.`,

  CLIENT_REPORT: (projectData: any) => `
You are a professional project manager writing a client report.

Project Data: ${JSON.stringify(projectData)}

Return ONLY a JSON object:
{
  "executiveSummary": "string",
  "milestones": [{ "name": "string", "status": "string", "completedDate": "string | null" }],
  "currentStatus": "string",
  "completedWork": ["string"],
  "upcomingWork": ["string"],
  "budget": { "status": "string", "notes": "string" },
  "risks": ["string"],
  "nextSteps": ["string"],
  "overallMessage": "string"
}

Return ONLY valid JSON, no explanation.`,

  RESOURCE_ALLOCATOR: (tasks: any[], members: any[]) => `
You are a resource allocation expert.

Unassigned Tasks: ${JSON.stringify(tasks)}
Available Team Members: ${JSON.stringify(members)}

Return ONLY a JSON array:
[{
  "taskId": "string",
  "taskTitle": "string",
  "recommendedAssignee": "string",
  "assigneeId": "string",
  "reasoning": "string",
  "workloadAfter": number
}]

Return ONLY valid JSON, no explanation.`,

  SCOPE_CREEP_DETECTOR: (originalScope: string, currentTasks: any[]) => `
You are a scope management expert.

Original Project Scope: ${originalScope}
Current Tasks: ${JSON.stringify(currentTasks)}

Return ONLY a JSON object:
{
  "scopeCreepDetected": boolean,
  "severity": "none" | "minor" | "moderate" | "severe",
  "originalScopeItems": ["string"],
  "addedItems": ["string"],
  "recommendations": ["string"],
  "impactOnTimeline": "string",
  "impactOnBudget": "string",
  "summary": "string"
}

Return ONLY valid JSON, no explanation.`,
};