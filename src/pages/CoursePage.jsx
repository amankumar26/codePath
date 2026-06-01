import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCourseProgress } from '../context/CourseProgressContext';
import htmlCourse from '../courses/html-cert.json';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Lock, ArrowLeft, BookOpen } from 'lucide-react';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isLessonCompleted, 
    getCourseProgress, 
    isWorkshopStepCompleted, 
    getLatestUnlockedWorkshopStep 
  } = useCourseProgress();

  const courseData = htmlCourse; 
  if (courseId !== 'html-cert') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white uppercase">Course Not Found</h2>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-brand-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Certifications
        </Link>
      </div>
    );
  }

  const { completedCount, totalCount, percentage } = getCourseProgress(courseData);

  // Flatten all lessons across all modules to calculate locks sequentially
  const allLessons = courseData.modules.flatMap((m) => m.lessons);

  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('codepath_last_visited_url');
    if (saved) {
      setResumeUrl(saved);
    }
  }, []);

  // Keep track of which modules are collapsed (default is expanded, so empty object means all expanded)
  const [collapsedModules, setCollapsedModules] = useState(() => {
    try {
      const saved = localStorage.getItem('codepath_collapsed_modules');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to parse collapsed modules from localStorage', e);
      return {};
    }
  });

  const toggleModule = (moduleId) => {
    setCollapsedModules((prev) => {
      const updated = {
        ...prev,
        [moduleId]: !prev[moduleId]
      };
      localStorage.setItem('codepath_collapsed_modules', JSON.stringify(updated));
      return updated;
    });
  };

  const getLessonStatus = (lessonId) => {
    const isCompleted = isLessonCompleted(lessonId);
    
    // Check if unlocked
    const idx = allLessons.findIndex((l) => l.id === lessonId);
    let isUnlocked = false;
    if (idx === 0) {
      isUnlocked = true; // First lesson is always unlocked
    } else if (idx > 0) {
      isUnlocked = isLessonCompleted(allLessons[idx - 1].id);
    }

    return { isCompleted, isUnlocked };
  };

  // Helper to determine step tags dynamically (similar to freeCodeCamp)
  const getLessonTypeTag = (les) => {
    if (les.type === 'workshop') {
      return { type: 'Workshop', color: 'border-sky-500/30 text-sky-500 bg-sky-500/5' };
    }
    const mapping = {
      'html-intro': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' },
      'html-structure': { type: 'Lab', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' },
      'html-headings': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' },
      'html-paragraphs': { type: 'Lab', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' },
      'html-links': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' },
      'html-images': { type: 'Lab', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' },
      'html-unordered-lists': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' },
      'html-ordered-lists': { type: 'Lab', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' },
      'html-tables': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' },
      'html-inputs': { type: 'Lab', color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' },
      'html-forms': { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' }
    };
    return mapping[les.id] || { type: 'Theory', color: 'border-amber-500/30 text-amber-500 bg-amber-500/5' };
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Back navigation */}
        <Link 
          to="/" 
          className="mine-btn text-xs mb-8 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Certifications</span>
        </Link>

        {/* freeCodeCamp Accordion Layout */}
        <div className="bg-[#0a0a23] border border-[#2a2a40] text-slate-200">
          
          {/* Main Course Header */}
          <div className="border-b border-[#2a2a40] bg-[#1b1b32] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-[#2a2a40] font-bold text-white text-xs">
                HTML
              </div>
              <div>
                <h1 className="text-md font-bold text-white uppercase tracking-wider">{courseData.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="text-slate-400">
                <span className="text-[#3b82f6] font-bold">{completedCount}</span> of <span className="text-white font-bold">{totalCount}</span> steps complete
              </div>
              {resumeUrl && (
                <Link
                  to={resumeUrl}
                  className="mine-btn mine-btn-green py-1.5 px-3 text-[10px] uppercase font-bold"
                >
                  Resume Last Lesson
                </Link>
              )}
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="divide-y divide-[#2a2a40]">
            {courseData.modules.map((mod) => {
              const totalModLessons = mod.lessons.length;
              const completedModLessons = mod.lessons.filter((l) => isLessonCompleted(l.id)).length;
              const isModuleCompleted = totalModLessons > 0 && totalModLessons === completedModLessons;
              const isCollapsed = collapsedModules[mod.id] || false;

              return (
                <div key={mod.id} className="bg-[#0a0a23]">
                  {/* Module Header Bar */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1b1b32]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                      
                      {/* Completion Circle */}
                      <span className="shrink-0">
                        {isModuleCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-[#22c55e] fill-[#22c55e]/10" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-500" />
                        )}
                      </span>

                      <span className="text-sm sm:text-base font-bold text-white">
                        {mod.title}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-semibold shrink-0">
                      {completedModLessons} of {totalModLessons} complete
                    </span>
                  </button>

                  {/* Lessons Steps List */}
                  {!isCollapsed && (
                    <div className="bg-[#000000]/30 border-t border-[#2a2a40] divide-y divide-[#2a2a40]">
                      {mod.lessons.map((les) => {
                        const { isCompleted, isUnlocked } = getLessonStatus(les.id);
                        const tagInfo = getLessonTypeTag(les);
                        
                        if (les.type === 'workshop') {
                          return (
                            <div key={les.id} className={`p-0 ${!isUnlocked ? 'opacity-40' : ''}`}>
                              {/* Title Row */}
                              <div
                                onClick={() => {
                                  if (isUnlocked) {
                                    const latest = getLatestUnlockedWorkshopStep(les.id, les.steps.length);
                                    navigate(`/course/${courseId}/lesson/${les.id}?step=${latest}`);
                                  }
                                }}
                                className={`flex items-center justify-between px-8 py-3.5 transition-colors border-b border-[#2a2a40]/30 ${
                                  !isUnlocked
                                    ? 'cursor-not-allowed'
                                    : 'hover:bg-[#1b1b32]/30 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-4 truncate">
                                  <span className="shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4.5 w-4.5 text-[#22c55e] fill-[#22c55e]/10" />
                                    ) : !isUnlocked ? (
                                      <Lock className="h-4 w-4 text-slate-600" />
                                    ) : (
                                      <Circle className="h-4.5 w-4.5 text-slate-400" />
                                    )}
                                  </span>

                                  <span className={`text-sm truncate font-bold uppercase tracking-wide ${isCompleted ? 'text-slate-400' : 'text-slate-200'}`}>
                                    {les.title}
                                  </span>

                                  <span className={`border px-1.5 py-0.5 text-[9px] rounded uppercase font-bold shrink-0 tracking-wide ${tagInfo.color}`}>
                                    {tagInfo.type}
                                  </span>
                                </div>

                                <div className="shrink-0 pl-4">
                                  {isCompleted ? (
                                    <span className="text-[10px] uppercase font-bold text-[#22c55e]">Review</span>
                                  ) : isUnlocked ? (
                                    <span className="text-[10px] uppercase font-bold text-[#3b82f6]">Start</span>
                                  ) : (
                                    <span className="text-[10px] uppercase font-bold text-slate-600">Locked</span>
                                  )}
                                </div>
                              </div>

                              {/* Steps Grid (visible only if unlocked) */}
                              {isUnlocked && (
                                <div className="px-8 py-4 bg-[#0a0a23]/60 flex flex-wrap gap-2 border-b border-[#2a2a40]/30">
                                  {les.steps.map((step) => {
                                    const stepNum = step.step;
                                    const isStepDone = isWorkshopStepCompleted(les.id, stepNum);
                                    const isStepUnlocked = stepNum === 1 || isWorkshopStepCompleted(les.id, stepNum - 1);

                                    let stepBtnStyle = "w-8.5 h-8.5 border-2 text-xs font-bold flex items-center justify-center transition-all rounded-none ";
                                    if (isStepDone) {
                                      stepBtnStyle += "bg-[#22c55e] border-[#22c55e] text-[#0a0a23] hover:bg-[#16a34a] hover:border-[#16a34a] cursor-pointer";
                                    } else if (isStepUnlocked) {
                                      stepBtnStyle += "bg-[#3b82f6] border-[#3b82f6] text-white hover:bg-blue-600 hover:border-blue-600 cursor-pointer";
                                    } else {
                                      stepBtnStyle += "bg-[#121224] border-[#1f1f38] text-slate-600 opacity-60 cursor-not-allowed";
                                    }

                                    return (
                                      <button
                                        key={stepNum}
                                        disabled={!isStepUnlocked}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/course/${courseId}/lesson/${les.id}?step=${stepNum}`);
                                        }}
                                        className={stepBtnStyle}
                                        title={`Step ${stepNum}: ${step.title}`}
                                      >
                                        {stepNum}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={les.id}
                            onClick={() => {
                              if (isUnlocked) navigate(`/course/${courseId}/lesson/${les.id}`);
                            }}
                            className={`flex items-center justify-between px-8 py-3.5 transition-colors ${
                              !isUnlocked
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-[#1b1b32]/30 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-4 truncate">
                              {/* Step completion bullet */}
                              <span className="shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-[#22c55e] fill-[#22c55e]/10" />
                                ) : !isUnlocked ? (
                                  <Lock className="h-4 w-4 text-slate-600" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5 text-slate-400" />
                                )}
                              </span>

                              <span className={`text-sm truncate font-medium ${isCompleted ? 'text-slate-400' : 'text-slate-200'}`}>
                                {les.title}
                              </span>

                              {/* Lesson Type Tag (Theory, Lab, Workshop) */}
                              <span className={`border px-1.5 py-0.5 text-[9px] rounded uppercase font-bold shrink-0 tracking-wide ${tagInfo.color}`}>
                                {tagInfo.type}
                              </span>
                            </div>

                            <div className="shrink-0 pl-4">
                              {isCompleted ? (
                                <span className="text-[10px] uppercase font-bold text-[#22c55e]">Review</span>
                              ) : isUnlocked ? (
                                <span className="text-[10px] uppercase font-bold text-[#3b82f6]">Start</span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold text-slate-600">Locked</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
