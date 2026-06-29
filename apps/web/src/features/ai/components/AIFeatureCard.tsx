// src/features/ai/components/AIFeatureCard.tsx
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface AIFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
  badge?: string;
  badgeColor?: string;
}

const AIFeatureCard = ({
  icon, title, description, onClick,
  isLoading = false, badge, badgeColor = "bg-indigo-100 text-indigo-600",
}: AIFeatureCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={clsx(
        "w-full text-left p-4 rounded-xl border transition-all duration-200 group",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md",
        "disabled:opacity-60 disabled:cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </p>
            {badge && (
              <span className={clsx("text-xs px-1.5 py-0.5 rounded-full font-medium", badgeColor)}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
};

export default AIFeatureCard;