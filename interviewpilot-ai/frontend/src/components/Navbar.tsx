import { Bot, Moon, Sun } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Setup", to: "/setup" },
  { label: "Result", to: "/result" },
  { label: "Report", to: "/report" }
];

export default function Navbar() {
  const { enabled, setEnabled } = useDarkMode();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white shadow-soft">
            <Bot size={22} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-normal">InterviewPilot AI</span>
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Practice HR Interviews with AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Toggle dark mode"
          >
            {enabled ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
