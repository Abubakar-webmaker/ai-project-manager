// src/components/layout/AuthLayout/AuthLayout.tsx
import { Outlet, Link } from "react-router-dom";
import { useTheme } from "../../../hooks/useTheme";
import { Moon, Sun, Zap } from "lucide-react";

const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            AI Project Manager
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © 2024 AI Project Manager. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;