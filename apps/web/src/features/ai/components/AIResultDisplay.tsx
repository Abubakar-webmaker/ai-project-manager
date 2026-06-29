// src/features/ai/components/AIResultDisplay.tsx
import { useState } from "react";
import { clsx } from "clsx";
import {
  Copy, Check, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Info, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface AIResultDisplayProps {
  title: string;
  result: any;
  type?: "tasks" | "sprint" | "report" | "risks" | "code" | "mood" |
    "standup" | "conflicts" | "client" | "resources" | "scope" |
    "priorities" | "estimate" | "deadline" | "meeting";
}

const AIResultDisplay = ({ title, result, type }: AIResultDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "high": return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200";
      default: return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return <XCircle className="w-4 h-4" />;
      case "high": return <AlertTriangle className="w-4 h-4" />;
      case "medium": return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    if (!result) return null;

    switch (type) {
      // Task Generator
      case "tasks":
        const tasks = Array.isArray(result) ? result : result.tasks || [];
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated {tasks.length} tasks
            </p>
            {tasks.map((task: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className={clsx(
                    "text-xs px-1.5 py-0.5 rounded font-medium shrink-0",
                    task.priority === "critical" && "bg-red-100 text-red-700 dark:bg-red-900/30",
                    task.priority === "high" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30",
                    task.priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
                    task.priority === "low" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
                    (!task.priority || task.priority === "none") && "bg-slate-100 text-slate-700 dark:bg-slate-800",
                  )}>
                    {task.priority || "none"}
                  </span>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {task.title}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 ml-0 mb-2">
                  {task.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {task.estimatedHours && (
                    <span>⏱ {task.estimatedHours}h estimated</span>
                  )}
                  {task.labels?.length > 0 && (
                    <span>🏷 {task.labels.join(", ")}</span>
                  )}
                </div>
                {task.subtasks?.length > 0 && (
                  <div className="mt-2 ml-2 space-y-1">
                    {task.subtasks.map((st: string, j: number) => (
                      <p key={j} className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                        {st}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      // Sprint Plan
      case "sprint":
        const sprint = result.sprintPlan || result;
        return (
          <div className="space-y-4">
            {sprint.sprintGoal && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  🎯 Sprint Goal
                </p>
                <p className="text-sm text-slate-900 dark:text-white">{sprint.sprintGoal}</p>
              </div>
            )}
            {sprint.totalEstimatedHours && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Total:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {sprint.totalEstimatedHours}h
                </span>
              </div>
            )}
            {sprint.risks?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Risks</p>
                <ul className="space-y-1">
                  {sprint.risks.map((risk: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-red-400 shrink-0">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sprint.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">✅ Recommendations</p>
                <ul className="space-y-1">
                  {sprint.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-green-400 shrink-0">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      // Progress Report
      case "report":
        const report = result.report || result;
        return (
          <div className="space-y-4">
            <div className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              report.overallHealth === "on_track" && "bg-green-100 text-green-700 dark:bg-green-900/20",
              report.overallHealth === "at_risk" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20",
              report.overallHealth === "critical" && "bg-red-100 text-red-700 dark:bg-red-900/20",
            )}>
              {report.overallHealth === "on_track" && "✅"}
              {report.overallHealth === "at_risk" && "⚠️"}
              {report.overallHealth === "critical" && "🚨"}
              {report.overallHealth?.replace("_", " ")} · {report.completionPercentage}% complete
            </div>

            {report.summary && (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {report.summary}
              </p>
            )}

            {report.accomplishments?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">🏆 Accomplishments</p>
                <ul className="space-y-1">
                  {report.accomplishments.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.blockers?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">🚧 Blockers</p>
                <ul className="space-y-1">
                  {report.blockers.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.nextSteps?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-2">📋 Next Steps</p>
                <ul className="space-y-1">
                  {report.nextSteps.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-blue-400 shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendation && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs font-semibold text-indigo-600 mb-1">💡 AI Recommendation</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{report.recommendation}</p>
              </div>
            )}
          </div>
        );

      // Risk Analyzer
      case "risks":
        const risks = result.risks || result;
        return (
          <div className="space-y-3">
            {Array.isArray(risks) && risks.map((risk: any, i: number) => (
              <div
                key={i}
                className={clsx(
                  "p-3 rounded-lg border",
                  getSeverityColor(risk.severity)
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getSeverityIcon(risk.severity)}
                  <p className="text-sm font-semibold">{risk.risk}</p>
                  <span className="text-xs opacity-70 ml-auto">
                    {risk.probability} probability
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-2">{risk.impact}</p>
                <div className="text-xs bg-white/50 dark:bg-black/20 rounded p-2">
                  <span className="font-medium">Mitigation: </span>
                  {risk.mitigation}
                </div>
              </div>
            ))}
          </div>
        );

      // Code Review
      case "code":
        const review = result.review || result;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "text-2xl font-bold",
                review.overallScore >= 8 ? "text-green-600" :
                review.overallScore >= 6 ? "text-yellow-600" : "text-red-600"
              )}>
                {review.overallScore}/10
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Code Quality Score
                </p>
                <p className="text-xs text-slate-500">{review.summary}</p>
              </div>
            </div>

            {review.issues?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">
                  🐛 Issues ({review.issues.length})
                </p>
                <div className="space-y-2">
                  {review.issues.map((issue: any, i: number) => (
                    <div
                      key={i}
                      className={clsx("p-2.5 rounded-lg border text-xs", getSeverityColor(issue.severity))}
                    >
                      <div className="flex items-center gap-2 mb-1 font-medium">
                        {getSeverityIcon(issue.severity)}
                        <span className="uppercase">{issue.type}</span>
                        {issue.line && <span className="ml-auto">Line {issue.line}</span>}
                      </div>
                      <p className="opacity-90 mb-1">{issue.description}</p>
                      <p className="opacity-70">💡 {issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {review.strengths?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">✅ Strengths</p>
                <ul className="space-y-1">
                  {review.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      // Team Mood
      case "mood":
        const mood = result.mood || result;
        const moodColors: Record<string, string> = {
          positive: "text-green-600 bg-green-50 dark:bg-green-900/20",
          neutral: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
          stressed: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
          negative: "text-red-600 bg-red-50 dark:bg-red-900/20",
        };
        const moodEmoji: Record<string, string> = {
          positive: "😊", neutral: "😐", stressed: "😰", negative: "😟",
        };
        return (
          <div className="space-y-4">
            <div className={clsx(
              "flex items-center gap-3 p-4 rounded-xl",
              moodColors[mood.overallMood] || "bg-slate-50 text-slate-600"
            )}>
              <span className="text-3xl">
                {moodEmoji[mood.overallMood] || "🤔"}
              </span>
              <div>
                <p className="font-bold text-lg capitalize">{mood.overallMood}</p>
                <p className="text-sm opacity-80">Score: {mood.moodScore}/100</p>
              </div>
            </div>

            {mood.summary && (
              <p className="text-sm text-slate-700 dark:text-slate-300">{mood.summary}</p>
            )}

            {mood.alerts?.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs font-semibold text-red-600 mb-2">🚨 Alerts</p>
                {mood.alerts.map((alert: string, i: number) => (
                  <p key={i} className="text-xs text-red-700 dark:text-red-400">{alert}</p>
                ))}
              </div>
            )}

            {mood.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-2">💡 Recommendations</p>
                <ul className="space-y-1">
                  {mood.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <span>→</span>{rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      // Standup
      case "standup":
        const standup = result.standup || result;
        return (
          <div className="space-y-4">
            {standup.formattedStandup && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                {standup.formattedStandup}
              </div>
            )}
            {standup.blockers?.length > 0 && standup.blockers[0] !== "None" && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-600 mb-1">⛔ Blockers</p>
                {standup.blockers.map((b: string, i: number) => (
                  <p key={i} className="text-xs text-red-700 dark:text-red-400">{b}</p>
                ))}
              </div>
            )}
          </div>
        );

      // Meeting Minutes
      case "meeting":
        const meeting = result.result || result;
        return (
          <div className="space-y-4">
            {meeting.meetingSummary && (
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {meeting.meetingSummary}
              </p>
            )}
            {meeting.decisions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-purple-600 mb-2">🏛️ Decisions</p>
                <ul className="space-y-1">
                  {meeting.decisions.map((d: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <span className="text-purple-400">•</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {meeting.actionItems?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-2">
                  ✅ Action Items ({meeting.actionItems.length})
                </p>
                <div className="space-y-2">
                  {meeting.actionItems.map((item: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        {item.assignee && <span>👤 {item.assignee}</span>}
                        {item.dueDate && <span>📅 {item.dueDate}</span>}
                        {item.priority && (
                          <span className={clsx(
                            "px-1.5 py-0.5 rounded font-medium",
                            item.priority === "high" ? "bg-orange-100 text-orange-600" :
                            item.priority === "critical" ? "bg-red-100 text-red-600" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // Scope Creep
      case "scope":
        const scope = result.result || result;
        return (
          <div className="space-y-4">
            <div className={clsx(
              "flex items-center gap-3 p-3 rounded-xl",
              scope.scopeCreepDetected
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            )}>
              <span className="text-2xl">
                {scope.scopeCreepDetected ? "🚨" : "✅"}
              </span>
              <div>
                <p className={clsx(
                  "font-semibold text-sm",
                  scope.scopeCreepDetected ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
                )}>
                  {scope.scopeCreepDetected ? "Scope Creep Detected!" : "No Scope Creep"}
                </p>
                <p className="text-xs opacity-70 capitalize">Severity: {scope.severity}</p>
              </div>
            </div>

            {scope.summary && (
              <p className="text-sm text-slate-700 dark:text-slate-300">{scope.summary}</p>
            )}

            {scope.addedItems?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 mb-2">➕ Added Items (Not in original scope)</p>
                <ul className="space-y-1">
                  {scope.addedItems.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <span className="text-red-400">+</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scope.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-600 mb-2">💡 Recommendations</p>
                <ul className="space-y-1">
                  {scope.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <span>→</span>{rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      // Default JSON view
      default:
        return (
          <pre className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default AIResultDisplay;