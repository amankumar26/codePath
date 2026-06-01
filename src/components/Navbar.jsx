import React from 'react';
import { Link } from 'react-router-dom';
import { useCourseProgress } from '../context/CourseProgressContext';
import htmlCourse from '../courses/html-cert.json';
import { Code2, Award, RefreshCw, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { getCourseProgress, resetProgress } = useCourseProgress();
  const { completedCount, totalCount, percentage } = getCourseProgress(htmlCourse);

  const handleResetProgress = () => {
    if (resetProgress()) {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-dark-800 bg-dark-900 py-2">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-none bg-brand-500 border-4 border-black text-black group-hover:bg-brand-600 transition-colors">
            <Code2 className="h-6 w-6 stroke-[3]" />
          </div>
          <span className="text-sm font-retro uppercase tracking-tight text-white">
            code<span className="text-brand-500">Path</span>
          </span>
        </Link>

        {/* Desktop Nav Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/course/html-cert"
            className="mine-btn text-[10px] h-10"
          >
            <div className="flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>

          {/* HTML Progress Status */}
          <div className="hidden sm:flex items-center gap-3 bg-dark-950 border-4 border-dark-800 px-4 h-10 text-[10px] font-retro text-slate-300">
            <Award className="h-4 w-4 text-brand-500" />
            <span>HTML:</span>
            <div className="w-20 bg-black border-2 border-dark-800 h-4 overflow-hidden relative">
              <div
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-brand-500">{completedCount}/{totalCount}</span>
          </div>

          {/* Reset Progress Action */}
          <button
            onClick={handleResetProgress}
            title="Reset progress"
            className="mine-btn mine-btn-red h-10 w-10 px-0"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
