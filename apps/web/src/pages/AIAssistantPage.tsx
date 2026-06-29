// src/pages/AIAssistantPage.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Bot, Sparkles, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { aiService } from "../features/ai/services/ai.service";
import AIFeatureCard from "../features/ai/components/AIFeatureCard";
import AIResultDisplay from "../features/ai/components/AIResultDisplay";
import Button from "../components/ui/Button/Button";

type AIFeatureKey =
  | "generateTasks" | "sprintPlan" | "progressReport" | "standup"
  | "riskAnalyzer" | "moodAnalyzer" | "conflictDetector" | "clientReport"
  | "resourceAllocator" | "scopeCreep" | "codeReview" | "meetingMinutes"
  | "priorities" | null;

interface AIResult {
  key: AIFeatureKey;
  title: string;
  data: any;
  type: any;
}

const AIAssistantPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [loadingFeature, setLoadingFeature] = useState<AIFeatureKey>(null);
  const [results, setResults] = useState<AIResult[]>([]);

  // Input states
  const [taskGenInput, setTaskGenInput] = useState({
    projectName: "", description: "", autoCreate: false,
  });
  const [sprintInput, setSprintInput] = useState({ teamSize: 3, sprintDays: 14 });
  const [codeInput, setCodeInput] = useState({ code: "", language: "javascript" });
  const [meetingInput, setMeetingInput] = useState({ notes: "", autoCreate: false });

  const [showInputs, setShowInputs] = useState<AIFeatureKey>(null);

  const runAI = async (key: AIFeatureKey, apiCall: () => Promise<any>, title: string, type: any) => {
    if (!projectId && key !== "codeReview") {
      toast.error("Please open this page from a project");
      return;
    }
    try {
      setLoadingFeature(key);
      const { data } = await apiCall();
      setResults((prev) => [
        { key, title, data: data.data, type },
        ...prev.filter((r) => r.key !== key),
      ]);
      setShowInputs(null);
      toast.success("AI analysis complete! ✨");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "AI request failed");
    } finally {
      setLoadingFeature(null);
    }
  };

  const features = [
    {
      key: "generateTasks" as AIFeatureKey,
      icon: "🎯",
      title: "Task Generator",
      description: "Describe your project and AI generates a complete task list with subtasks, priorities, and estimates.",
      badge: "Popular",
      badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      hasInput: true,
    },
    {
      key: "sprintPlan" as AIFeatureKey,
      icon: "🏃",
      title: "Sprint Planner",
      description: "AI analyzes your backlog and creates an optimal sprint plan based on team size and capacity.",
      badge: "Smart",
      hasInput: true,
    },
    {
      key: "progressReport" as AIFeatureKey,
      icon: "📊",
      title: "Progress Report",
      description: "Generate a comprehensive project progress report with insights, blockers, and recommendations.",
    },
    {
      key: "standup" as AIFeatureKey,
      icon: "🌅",
      title: "Standup Generator",
      description: "Auto-generate your daily standup notes based on task activity.",
    },
    {
      key: "riskAnalyzer" as AIFeatureKey,
      icon: "⚠️",
      title: "Risk Analyzer",
      description: "Identify potential risks, blockers, and issues before they impact your project.",
    },
    {
      key: "moodAnalyzer" as AIFeatureKey,
      icon: "😊",
      title: "Team Mood Analyzer",
      description: "Analyze team sentiment from recent comments and activity to detect stress or motivation issues.",
      badge: "Unique",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/20",
    },
    {
      key: "conflictDetector" as AIFeatureKey,
      icon: "⚡",
      title: "Conflict Detector",
      description: "Detect scheduling conflicts, resource overloads, and deadline clashes in your team.",
    },
    {
      key: "clientReport" as AIFeatureKey,
      icon: "📋",
      title: "Client Report",
      description: "Generate a professional client-ready progress report with executive summary.",
      badge: "Pro",
      badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20",
    },
    {
      key: "resourceAllocator" as AIFeatureKey,
      icon: "👥",
      title: "Resource Allocator",
      description: "AI analyzes workloads and recommends optimal task assignments for your team.",
    },
    {
      key: "scopeCreep" as AIFeatureKey,
      icon: "🔍",
      title: "Scope Creep Detector",
      description: "Compare current tasks against original project scope to detect unplanned additions.",
      badge: "Unique",
      badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/20",
    },
    {
      key: "codeReview" as AIFeatureKey,
      icon: "💻",
      title: "Code Reviewer",
      description: "Paste any code and get instant AI review with bugs, security issues, and suggestions.",
      hasInput: true,
    },
    {
      key: "meetingMinutes" as AIFeatureKey,
      icon: "📝",
      title: "Meeting Minutes",
      description: "Paste meeting notes and AI extracts action items, decisions, and creates tasks automatically.",
      hasInput: true,
    },
    {
      key: "priorities" as AIFeatureKey,
      icon: "🎖️",
      title: "Priority Suggester",
      description: "AI analyzes deadlines, workload, and complexity to suggest optimal task priorities.",
    },
  ];

  const handleFeatureClick = (feature: typeof features[0]) => {
    if (feature.hasInput) {
      setShowInputs(feature.key);
    } else {
      const apiMap: Record<string, () => Promise<any>> = {
        progressReport: () => aiService.getProgressReport(projectId!),
        standup: () => aiService.getStandup(projectId!),
        riskAnalyzer: () => aiService.analyzeRisks(projectId!),
        moodAnalyzer: () => aiService.analyzeMood(projectId!),
        conflictDetector: () => aiService.detectConflicts(projectId!),
        clientReport: () => aiService.generateClientReport(projectId!),
        resourceAllocator: () => aiService.allocateResources(projectId!),
        scopeCreep: () => aiService.detectScopeCreep(projectId!),
        priorities: () => aiService.suggestPriorities(projectId!),
      };

      const typeMap: Record<string, string> = {
        progressReport: "report",
        standup: "standup",
        riskAnalyzer: "risks",
        moodAnalyzer: "mood",
        conflictDetector: "conflicts",
        clientReport: "client",
        resourceAllocator: "resources",
        scopeCreep: "scope",
        priorities: "priorities",
      };

      if (apiMap[feature.key!]) {
        runAI(
          feature.key,
          apiMap[feature.key!],
          feature.title,
          typeMap[feature.key!]
        );
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Assistant</h1>
            <p className="text-indigo-200 text-sm">Powered by LLaMA 3.3 70B via Groq</p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">
          16 AI features to supercharge your project management. Generate tasks,
          analyze risks, plan sprints, and much more — all powered by advanced AI.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-indigo-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            16 AI Features
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Real-time Analysis
          </div>
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            LLaMA 3.3 70B
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Feature Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            AI Features
          </h2>
          <div className="space-y-2">
            {features.map((feature) => (
              <AIFeatureCard
                key={feature.key}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                badge={feature.badge}
                badgeColor={feature.badgeColor}
                isLoading={loadingFeature === feature.key}
                onClick={() => handleFeatureClick(feature)}
              />
            ))}
          </div>
        </div>

        {/* Right: Inputs + Results */}
        <div className="space-y-4">
          {/* Input Panels */}
          {showInputs === "generateTasks" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                🎯 Task Generator
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Project Name
                  </label>
                  <input
                    value={taskGenInput.projectName}
                    onChange={(e) => setTaskGenInput({ ...taskGenInput, projectName: e.target.value })}
                    placeholder="E-commerce Platform"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Project Description
                  </label>
                  <textarea
                    value={taskGenInput.description}
                    onChange={(e) => setTaskGenInput({ ...taskGenInput, description: e.target.value })}
                    placeholder="Build a full-stack e-commerce platform with React, Node.js, and Stripe payments..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskGenInput.autoCreate}
                    onChange={(e) => setTaskGenInput({ ...taskGenInput, autoCreate: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Auto-create tasks in project
                  </span>
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInputs(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    isLoading={loadingFeature === "generateTasks"}
                    onClick={() =>
                      runAI(
                        "generateTasks",
                        () => aiService.generateTasks({
                          ...taskGenInput,
                          projectId,
                        }),
                        "Generated Tasks",
                        "tasks"
                      )
                    }
                  >
                    Generate Tasks
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showInputs === "sprintPlan" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                🏃 Sprint Planner
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Team Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={sprintInput.teamSize}
                      onChange={(e) => setSprintInput({ ...sprintInput, teamSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Sprint Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={sprintInput.sprintDays}
                      onChange={(e) => setSprintInput({ ...sprintInput, sprintDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowInputs(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    isLoading={loadingFeature === "sprintPlan"}
                    onClick={() =>
                      runAI(
                        "sprintPlan",
                        () => aiService.planSprint({ ...sprintInput, projectId }),
                        "Sprint Plan",
                        "sprint"
                      )
                    }
                  >
                    Plan Sprint
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showInputs === "codeReview" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                💻 Code Reviewer
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Language
                  </label>
                  <select
                    value={codeInput.language}
                    onChange={(e) => setCodeInput({ ...codeInput, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {["javascript", "typescript", "python", "java", "go", "rust", "php", "css"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Code
                  </label>
                  <textarea
                    value={codeInput.code}
                    onChange={(e) => setCodeInput({ ...codeInput, code: e.target.value })}
                    placeholder="Paste your code here..."
                    rows={8}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowInputs(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    isLoading={loadingFeature === "codeReview"}
                    onClick={() =>
                      runAI(
                        "codeReview",
                        () => aiService.reviewCode(codeInput.code, codeInput.language),
                        "Code Review",
                        "code"
                      )
                    }
                  >
                    Review Code
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showInputs === "meetingMinutes" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                📝 Meeting Minutes
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Meeting Notes
                  </label>
                  <textarea
                    value={meetingInput.notes}
                    onChange={(e) => setMeetingInput({ ...meetingInput, notes: e.target.value })}
                    placeholder="Paste your meeting notes here..."
                    rows={6}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingInput.autoCreate}
                    onChange={(e) => setMeetingInput({ ...meetingInput, autoCreate: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Auto-create action item tasks
                  </span>
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowInputs(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    isLoading={loadingFeature === "meetingMinutes"}
                    onClick={() =>
                      runAI(
                        "meetingMinutes",
                        () => aiService.processMeetingMinutes({ ...meetingInput, projectId }),
                        "Meeting Minutes",
                        "meeting"
                      )
                    }
                  >
                    Process Minutes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                AI Results
              </h2>
              {results.map((result, i) => (
                <AIResultDisplay
                  key={`${result.key}-${i}`}
                  title={result.title}
                  result={result.data}
                  type={result.type}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && !showInputs && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Bot className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Select an AI feature to get started
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Results will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;