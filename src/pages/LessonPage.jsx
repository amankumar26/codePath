import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useCourseProgress } from '../context/CourseProgressContext';
import htmlCourse from '../courses/html-cert.json';
import { quizzes } from '../courses/quizzes';
import { runTests } from '../utils/testRunner';
import { 
  Play, RotateCcw, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, ArrowRight, Award, HelpCircle, 
  Terminal, MonitorPlay, FileText, Check, AlertCircle, BookOpen, Lock
} from 'lucide-react';

const renderMarkdown = (text) => {
  if (!text) return null;
  
  // Split by ``` to separate code blocks from prose
  const parts = text.split(/```/);
  
  return parts.map((part, index) => {
    // Odd indices are fenced code blocks
    if (index % 2 === 1) {
      const lines = part.split('\n');
      const firstLine = lines[0].trim();
      const hasLang = ['html', 'css', 'javascript', 'js'].includes(firstLine.toLowerCase());
      const code = hasLang ? lines.slice(1).join('\n') : part;
      
      return (
        <pre key={index} className="border-2 border-dark-800 bg-black p-4 font-mono text-xs overflow-x-auto text-slate-300 my-4 leading-relaxed">
          <code>{code.trim()}</code>
        </pre>
      );
    }
    
    // Even indices are normal paragraphs
    const paragraphs = part.split(/\n\n+/);
    
    return paragraphs.map((para, paraIdx) => {
      if (!para.trim()) return null;
      
      const subparts = para.split(/`/);
      const textElements = subparts.map((subpart, subIdx) => {
        if (subIdx % 2 === 1) {
          return (
            <code key={subIdx} className="bg-black/60 border border-dark-800 px-1.5 py-0.5 font-mono text-xs text-[#22c55e] mx-0.5">
              {subpart}
            </code>
          );
        }
        return subpart;
      });

      return (
        <p key={`${index}-${paraIdx}`} className="text-sm leading-relaxed text-slate-300 my-3">
          {textElements}
        </p>
      );
    });
  });
};

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const stepParam = parseInt(queryParams.get('step') || '1', 10);

  const { 
    completedLessons, 
    completeLesson, 
    isLessonCompleted,
    completedWorkshopSteps,
    completeWorkshopStep,
    isWorkshopStepCompleted,
    getLatestUnlockedWorkshopStep
  } = useCourseProgress();

  const courseData = htmlCourse; // MVP HTML course
  const allLessons = courseData.modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[currentLessonIndex];

  // Stage state: 'theory' | 'quiz' | 'code'
  const [stage, setStage] = useState('theory');
  const [editorCode, setEditorCode] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [runClicked, setRunClicked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // mobile tabs

  // Quiz-specific state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState('');

  const updateStage = (newStage) => {
    setStage(newStage);
    if (lesson) {
      localStorage.setItem(`devloperpath_stage_${lesson.id}`, newStage);
    }
  };

  // Ref to track code initialization
  const codeInitializedRef = useRef('');

  // Fetch quizzes for current lesson
  const lessonQuiz = quizzes[lessonId] || [];

  const isWorkshop = lesson && lesson.type === 'workshop';
  const currentStepIndex = isWorkshop ? (stepParam - 1) : 0;
  const currentStep = isWorkshop && lesson.steps ? lesson.steps[currentStepIndex] : null;

  // Reset states when lessonId or stepParam changes
  useEffect(() => {
    if (!lesson) return;

    if (lesson.type === 'workshop') {
      if (!currentStep) return;
      
      const savedDraft = localStorage.getItem(`devloperpath_draft_${lesson.id}_step_${stepParam}`);
      const codeToLoad = savedDraft !== null ? savedDraft : currentStep.starterCode;
      
      setEditorCode(codeToLoad);
      codeInitializedRef.current = `${lesson.id}_step_${stepParam}`;
      setPreviewDoc(getWrappedPreview(codeToLoad));
      setTestResults(
        currentStep.tests.map((t) => ({ description: t.description, passed: null, error: null }))
      );
      setRunClicked(false);
      setShowSuccessModal(false);
    } else {
      const savedStage = localStorage.getItem(`devloperpath_stage_${lesson.id}`) || 'theory';
      const savedAnswers = JSON.parse(localStorage.getItem(`devloperpath_selected_answers_${lesson.id}`) || '{}');
      const savedSubmitted = localStorage.getItem(`devloperpath_quiz_submitted_${lesson.id}`) === 'true';
      const savedPassed = localStorage.getItem(`devloperpath_quiz_passed_${lesson.id}`) === 'true' || isLessonCompleted(lesson.id);

      setStage(savedStage);
      setSelectedAnswers(savedAnswers);
      setQuizSubmitted(savedSubmitted);
      setQuizPassed(savedPassed);
      setQuizError('');

      const savedDraft = localStorage.getItem(`devloperpath_draft_${lesson.id}`);
      const codeToLoad = savedDraft !== null ? savedDraft : lesson.starterCode;
      
      setEditorCode(codeToLoad);
      codeInitializedRef.current = lesson.id;
      setPreviewDoc(getWrappedPreview(codeToLoad));
      setTestResults(
        lesson.tests.map((t) => ({ description: t.description, passed: null, error: null }))
      );
      setRunClicked(false);
      setShowSuccessModal(false);
    }
  }, [lessonId, lesson, stepParam]);

  // Save last visited lesson url to local storage
  useEffect(() => {
    if (lesson) {
      localStorage.setItem('devloperpath_last_visited_url', location.pathname + location.search);
    }
  }, [location, lesson]);

  // Unlock code stage if already completed lessons list changes (sync checks)
  useEffect(() => {
    if (lesson && isLessonCompleted(lesson.id)) {
      setQuizPassed(true);
    }
  }, [completedLessons, lesson]);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white uppercase">Lesson Not Found</h2>
        <Link to={`/course/${courseId}`} className="mt-4 inline-flex items-center gap-2 text-brand-500 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Next and Previous Lesson navigation
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Next lesson check status (for lock styling in navigation)
  const isLessonLocked = (lesId) => {
    const idx = allLessons.findIndex((l) => l.id === lesId);
    if (idx <= 0) return false;
    return !isLessonCompleted(allLessons[idx - 1].id);
  };

  // Helper to wrap user code for iframe render
  function getWrappedPreview(rawCode) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 1rem;
            color: #d4d4d8;
            background-color: #09090b;
            margin: 0;
            line-height: 1.6;
            font-size: 14px;
          }
          a { color: #22c55e; text-decoration: underline; }
          a:hover { color: #16a34a; }
          img { max-width: 100%; height: auto; border: 2px solid #27272a; margin: 0.5rem 0; }
          table { border-collapse: collapse; width: 100%; margin: 1rem 0; background: #18181b; }
          th, td { border: 1px solid #27272a; padding: 10px; text-align: left; }
          th { background-color: #27272a; color: #22c55e; font-weight: bold; }
          label { display: block; margin-bottom: 6px; font-weight: bold; color: #a1a1aa; }
          input[type="text"], input[type="email"] {
            width: 100%;
            background: #18181b;
            border: 2px solid #27272a;
            color: white;
            padding: 8px 12px;
            box-sizing: border-box;
            margin-bottom: 12px;
          }
          input:focus { border-color: #22c55e; outline: none; }
          button[type="submit"], button {
            background: #22c55e;
            color: #09090b;
            border: none;
            padding: 8px 14px;
            font-weight: bold;
            cursor: pointer;
          }
          button:hover { background: #16a34a; }
        </style>
      </head>
      <body>
        ${rawCode}
      </body>
      </html>
    `;
  }

  const handleEditorChange = (value) => {
    setEditorCode(value || '');
    if (lesson.type === 'workshop') {
      localStorage.setItem(`devloperpath_draft_${lesson.id}_step_${stepParam}`, value || '');
    } else {
      localStorage.setItem(`devloperpath_draft_${lesson.id}`, value || '');
    }
  };

  const handleRun = () => {
    setRunClicked(true);
    setPreviewDoc(getWrappedPreview(editorCode));
    
    if (lesson.type === 'workshop') {
      const results = runTests(editorCode, currentStep.tests);
      setTestResults(results);

      const allPassed = results.length > 0 && results.every((r) => r.passed);
      if (allPassed) {
        completeWorkshopStep(lesson.id, stepParam, lesson.steps.length);
        setShowSuccessModal(true);
      }
    } else {
      const results = runTests(editorCode, lesson.tests);
      setTestResults(results);

      const allPassed = results.length > 0 && results.every((r) => r.passed);
      if (allPassed) {
        completeLesson(lesson.id);
        setShowSuccessModal(true);
      }
    }
  };

  const handleReset = () => {
    const starter = lesson.type === 'workshop' ? currentStep.starterCode : lesson.starterCode;
    const msg = lesson.type === 'workshop'
      ? `Reset this editor to the starter code for Step ${stepParam}? Your changes for this step will be lost.`
      : 'Reset this editor to the lesson starter code? Your changes will be lost.';

    if (window.confirm(msg)) {
      setEditorCode(starter);
      if (lesson.type === 'workshop') {
        localStorage.setItem(`devloperpath_draft_${lesson.id}_step_${stepParam}`, starter);
      } else {
        localStorage.setItem(`devloperpath_draft_${lesson.id}`, starter);
      }
      setTestResults(
        (lesson.type === 'workshop' ? currentStep.tests : lesson.tests).map((t) => ({ description: t.description, passed: null, error: null }))
      );
      setRunClicked(false);
      setPreviewDoc(getWrappedPreview(starter));
    }
  };

  const handleNextLessonClick = () => {
    setShowSuccessModal(false);
    if (lesson.type === 'workshop') {
      if (stepParam < lesson.steps.length) {
        navigate(`/course/${courseId}/lesson/${lesson.id}?step=${stepParam + 1}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    } else {
      if (nextLesson) {
        navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    }
  };

  // Quiz submission verification
  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    localStorage.setItem(`devloperpath_quiz_submitted_${lesson.id}`, 'true');
    setQuizError('');

    // Check if every question has an answer and if it is correct
    let hasUnanswered = false;
    let hasIncorrect = false;

    lessonQuiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected === undefined || selected === null) {
        hasUnanswered = true;
      } else if (selected !== q.correctIndex) {
        hasIncorrect = true;
      }
    });

    if (hasUnanswered) {
      setQuizError('Please answer all the quiz questions before submitting.');
      return;
    }

    if (hasIncorrect) {
      setQuizError('Some answers are incorrect. Please review the highlighted options and try again.');
      return;
    }

    // Passed!
    setQuizPassed(true);
    localStorage.setItem(`devloperpath_quiz_passed_${lesson.id}`, 'true');
    // Keep stage as 'quiz' so user can see correct/incorrect feedback
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizPassed) return;

    // Reset feedback state if the user changes their selection
    if (quizSubmitted) {
      setQuizSubmitted(false);
      setQuizError('');
      localStorage.setItem(`devloperpath_quiz_submitted_${lesson.id}`, 'false');
    }

    setSelectedAnswers(prev => {
      const updated = {
        ...prev,
        [qIdx]: optIdx
      };
      localStorage.setItem(`devloperpath_selected_answers_${lesson.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (lesson.type === 'workshop') {
    if (!currentStep) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-white uppercase">Step Not Found</h2>
          <Link to={`/course/${courseId}`} className="mt-4 inline-flex items-center gap-2 text-brand-500 hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Syllabus
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-950 text-slate-200">
        
        {/* 1. Global Workshop HUD Header */}
        <div className="bg-[#1b1b32] border-b-2 border-dark-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 z-10">
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
            <Link
              to={`/course/${courseId}`}
              className="mine-btn h-9 px-3 flex items-center justify-center gap-1 text-xs uppercase"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Syllabus</span>
            </Link>
            <span className="text-xs text-slate-300 font-bold bg-[#0a0a23] border border-[#2a2a40] px-3 py-1.5 rounded-none uppercase truncate max-w-[180px] sm:max-w-none">
              Workshop: {lesson.title}
            </span>
          </div>

          {/* Numbered Steps Navigator (FCC style) */}
          <div className="flex flex-wrap items-center justify-center gap-1 bg-[#0a0a23] border border-[#2a2a40] p-1 text-xs w-full md:w-auto">
            <span className="text-slate-400 font-bold uppercase px-2 text-[10px]">Steps:</span>
            {lesson.steps.map((step) => {
              const stepNum = step.step;
              const isStepDone = isWorkshopStepCompleted(lesson.id, stepNum);
              const isStepUnlocked = stepNum === 1 || isWorkshopStepCompleted(lesson.id, stepNum - 1);
              
              let stepBtnStyle = "px-3 py-1.5 font-bold transition-all rounded-none ";
              if (stepNum === stepParam) {
                stepBtnStyle += "bg-[#3b82f6] text-white";
              } else if (isStepDone) {
                stepBtnStyle += "bg-[#22c55e] text-[#0a0a23] hover:bg-[#16a34a]";
              } else if (isStepUnlocked) {
                stepBtnStyle += "text-slate-300 hover:text-white hover:bg-slate-800";
              } else {
                stepBtnStyle += "text-slate-600 cursor-not-allowed opacity-50";
              }

              return (
                <button
                  key={stepNum}
                  disabled={!isStepUnlocked}
                  onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}?step=${stepNum}`)}
                  className={stepBtnStyle}
                >
                  {stepNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Workspace Viewports */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Instructions Column (40% width) */}
          <section
            className={`flex flex-col h-full bg-dark-900 overflow-y-auto ${
              activeTab === 'instructions' ? 'flex' : 'hidden lg:flex'
            }`}
            style={{ flexBasis: '40%' }}
          >
            <div className="sticky top-0 z-10 bg-dark-900 border-b-2 border-dark-800 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 bg-black border-2 border-dark-800 px-3 py-1.5 font-semibold">
                Step {stepParam} of {lesson.steps.length}: {currentStep.title}
              </span>
            </div>

            {/* Step Content */}
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
              <div className="block-panel p-5 space-y-4">
                <h3 className="text-white text-xs uppercase font-bold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center bg-brand-500 text-black text-xs font-extrabold">!</span>
                  <span>Objective</span>
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-semibold bg-black p-3 border-2 border-dark-800">
                  {currentStep.challenge}
                </p>
              </div>

              {/* Show main lesson examples as references if available */}
              {lesson.examples && (
                <div className="block-panel p-5">
                  <h3 className="text-white text-xs uppercase font-bold flex items-center gap-2 mb-2">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#3b82f6] text-white text-[10px] font-extrabold font-mono">i</span>
                    <span>Example Syntax</span>
                  </h3>
                  {renderMarkdown(lesson.examples)}
                </div>
              )}

              {/* General Guidelines */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructions</h4>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li>Write your code inside the editor on the right.</li>
                  <li>Click <strong>Run Code</strong> in the header controls to build and inspect output.</li>
                  <li>Ensure all validation tests pass to complete this step and unlock the next.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monaco IDE Workspace (60% width) */}
          <section
            className={`flex-1 flex flex-col h-full border-l-2 border-dark-800 bg-dark-950 ${
              activeTab !== 'instructions' ? 'flex' : 'hidden lg:flex'
            }`}
            style={{ flexBasis: '60%' }}
          >
            {/* Header bar controls */}
            <div className="p-3 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900">
              {/* Mobile tabs */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'instructions' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Objective
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'editor' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'preview' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Output
                </button>
              </div>

              <span className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Terminal className="h-4 w-4 text-brand-500" />
                <span>INTERACTIVE WORKSHOP EDITOR</span>
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleReset}
                  className="mine-btn mine-btn-red text-xs h-9"
                  title="Reset Code"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleRun}
                  className="mine-btn mine-btn-green text-xs h-9"
                  title="Run code & tests"
                >
                  <Play className="h-3.5 w-3.5 mr-1 fill-black" />
                  <span>Run Code</span>
                </button>
              </div>
            </div>

            {/* Split panels */}
            <div className={`flex-1 relative ${activeTab === 'editor' || activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
              <div className="absolute inset-0 flex flex-col h-full">
                {/* Monaco editor */}
                <div className={`flex-1 min-h-0 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
                  <Editor
                    height="100%"
                    language={lesson.language}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                      cursorBlinking: 'smooth',
                      fontFamily: "'JetBrains Mono', Courier, monospace",
                      tabSize: 2,
                    }}
                  />
                </div>

                {/* Live Preview + Tests pane */}
                <div className={`flex-1 border-t-2 border-dark-800 flex flex-col lg:flex-row min-h-0 bg-dark-950 ${
                  activeTab === 'preview' ? 'block' : 'hidden lg:flex'
                }`}>
                  
                  {/* Preview container */}
                  <div className="flex-1 border-b-2 lg:border-b-0 lg:border-r-2 border-dark-800 flex flex-col min-h-[160px] lg:min-h-0">
                    <div className="px-4 py-2 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900 text-xs font-bold uppercase text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MonitorPlay className="h-3.5 w-3.5 text-brand-500" />
                        <span>Output Render</span>
                      </span>
                    </div>
                    <div className="flex-1 bg-[#09090b]">
                      <iframe
                        title="Live Code Preview"
                        srcDoc={previewDoc}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  {/* Tests container */}
                  <div className="flex-1 flex flex-col min-h-[160px] lg:min-h-0 bg-dark-950">
                    <div className="px-4 py-2 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900 text-xs font-bold uppercase text-slate-400">
                      <span>Tests Results</span>
                      {runClicked && (
                        <span>
                          {testResults.filter((t) => t.passed).length} / {testResults.length} OK
                        </span>
                      )}
                    </div>
                    
                    {/* List results */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {testResults.map((test, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start gap-3 border-2 p-3 text-sm ${
                            test.passed === null
                              ? 'border-dark-800 bg-black/45 text-slate-500'
                              : test.passed
                              ? 'border-brand-500/30 bg-brand-500/5 text-slate-300'
                              : 'border-red-500/30 bg-red-500/5 text-slate-300'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {test.passed === null ? (
                              <div className="h-4.5 w-4.5 border-2 border-slate-600 bg-slate-800"></div>
                            ) : test.passed ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-brand-500" />
                            ) : (
                              <XCircle className="h-4.5 w-4.5 text-red-500" />
                            )}
                          </span>

                          <div className="space-y-1">
                            <p>{test.description}</p>
                            {test.error && (
                              <pre className="text-xs text-red-400 overflow-x-auto bg-black/20 p-2 border border-red-500/20 mt-1.5 font-mono">
                                {test.error}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!runClicked && (
                        <div className="text-center py-6 text-slate-500 text-xs uppercase">
                          Click <strong className="text-brand-500">Run Code</strong> to test.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </section>

        </div>

        {/* 3. STEP SUCCESS CELEBRATION MODAL OVERLAY */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
            <div className="block-panel w-full max-w-md p-8 text-center relative">
              
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-brand-500 border border-brand-500 text-black mb-6">
                <CheckCircle2 className="h-8 w-8 animate-bounce" />
              </div>

              <h3 className="text-lg font-bold text-white uppercase">
                {stepParam === lesson.steps.length ? 'Workshop Completed!' : 'Step Passed!'}
              </h3>
              <p className="text-slate-300 mt-4 leading-relaxed">
                {stepParam === lesson.steps.length 
                  ? `Fantastic job! You completed all steps for ${lesson.title}!` 
                  : `Success! You passed all requirements for Step ${stepParam}: ${currentStep.title}.`}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleNextLessonClick}
                  className="mine-btn mine-btn-green w-full uppercase"
                >
                  <span>
                    {stepParam === lesson.steps.length 
                      ? 'Back to Syllabus' 
                      : 'Next Step'}
                  </span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="mine-btn w-full uppercase"
                >
                  Inspect Code
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-950 text-slate-200">
      
      {/* 1. Global Stage Progress HUD Header */}
      <div className="bg-[#1b1b32] border-b-2 border-dark-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 z-10">
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <Link
            to={`/course/${courseId}`}
            className="mine-btn h-9 px-3 flex items-center justify-center gap-1 text-xs uppercase"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Syllabus</span>
          </Link>
          <span className="text-xs text-slate-300 font-bold bg-[#0a0a23] border border-[#2a2a40] px-3 py-1.5 rounded-none uppercase truncate max-w-[180px] sm:max-w-none">
            Lesson {currentLessonIndex + 1}: {lesson.title}
          </span>
        </div>

        {/* Horizontal Step Progression Tabs */}
        <div className="flex items-center justify-center gap-1 bg-[#0a0a23] border border-[#2a2a40] p-1 text-xs w-full md:w-auto">
          <button
            onClick={() => updateStage('theory')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors rounded-none ${
              stage === 'theory' ? 'bg-[#3b82f6] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Theory
          </button>
          
          <button
            onClick={() => updateStage('quiz')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors rounded-none ${
              stage === 'quiz' ? 'bg-[#3b82f6] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Quiz
          </button>
 
          <button
            disabled={!quizPassed}
            onClick={() => {
              if (quizPassed) updateStage('code');
            }}
            className={`px-3 py-1.5 font-bold uppercase transition-colors rounded-none flex items-center gap-1 ${
              stage === 'code' 
                ? 'bg-[#3b82f6] text-white' 
                : quizPassed 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            {!quizPassed && <Lock className="h-3 w-3 shrink-0" />}
            <span>3. Code<span className="hidden sm:inline"> Practice</span></span>
          </button>
        </div>
      </div>

      {/* 2. Stage-Specific Viewports */}

      {/* ================= STAGE 1: THEORY READ VIEW ================= */}
      {stage === 'theory' && (
        <div className="flex-1 overflow-y-auto px-6 py-12 flex justify-center bg-[#0a0a23]">
          <div className="max-w-3xl w-full space-y-8 animate-float-none">
            
            {/* Header Title */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 rounded">
                Stage 1: Core Theory & Concept
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight uppercase">
                {lesson.title}
              </h2>
              <div className="h-1.5 w-20 bg-amber-500 mx-auto mt-4"></div>
            </div>

            {/* Content text */}
            <div className="block-panel p-8 space-y-4">
              {renderMarkdown(lesson.explanation)}
              {lesson.examples && renderMarkdown(lesson.examples)}
            </div>

            {/* Tips Box */}
            {lesson.tips && (
              <div className="border-2 border-amber-500/30 bg-amber-500/5 p-5 flex gap-4 text-slate-300 text-sm">
                <HelpCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-500 font-bold block text-xs uppercase mb-1">Developer Tip</strong>
                  <p className="text-sm leading-relaxed">{lesson.tips}</p>
                </div>
              </div>
            )}

            {/* Continue to Quiz Action */}
            <div className="pt-6 flex justify-center">
              <button
                onClick={() => updateStage('quiz')}
                className="mine-btn mine-btn-green px-10 py-4 text-sm uppercase flex items-center gap-2"
              >
                <span>Continue to Quiz</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= STAGE 2: MULTIPLE CHOICE QUIZ VIEW ================= */}
      {stage === 'quiz' && (
        <div className="flex-1 overflow-y-auto px-6 py-12 flex justify-center bg-[#0a0a23]">
          <div className="max-w-3xl w-full space-y-8">
            
            {/* Header Title */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest border border-blue-500/30 bg-blue-500/5 px-2.5 py-1 rounded">
                Stage 2: Conceptual Quiz
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight uppercase">
                Challenge Trivia
              </h2>
              <p className="text-sm text-slate-400 mt-2">Answer these 3 questions to unlock the interactive coding sandbox.</p>
              <div className="h-1.5 w-20 bg-[#3b82f6] mx-auto mt-4"></div>
            </div>

            {/* Error alerts */}
            {quizError && (
              <div className="border-2 border-red-500 bg-red-500/5 p-4 flex gap-3 text-sm text-red-200">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="font-semibold">{quizError}</p>
              </div>
            )}

            {/* Success alert */}
            {quizPassed && (
              <div className="border-2 border-brand-500 bg-brand-500/5 p-4 flex gap-3 text-sm text-brand-400">
                <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase text-xs mb-1">Stage Completed!</p>
                  <p className="font-semibold">All answers are correct. You are ready to start coding!</p>
                </div>
              </div>
            )}

            {/* Questions Grid */}
            <div className="space-y-6">
              {lessonQuiz.map((q, qIdx) => {
                const selected = selectedAnswers[qIdx];
                const isSelected = (optIdx) => selected === optIdx;

                return (
                  <div key={qIdx} className="block-panel p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      Question {qIdx + 1}: {q.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = "mine-btn w-full text-left justify-start py-3 text-sm px-4";
                        
                        if (isSelected(optIdx)) {
                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnStyle += " border-emerald-500! bg-[#22c55e]/10 text-emerald-400! font-bold";
                            } else {
                              btnStyle += " border-red-500! bg-red-500/10 text-red-400! font-bold";
                            }
                          } else {
                            btnStyle += " border-[#3b82f6]! bg-[#3b82f6]/10 text-white! font-bold";
                          }
                        } else if (quizSubmitted && optIdx === q.correctIndex) {
                          // Highlight correct option if user got it wrong
                          btnStyle += " border-emerald-500/60! bg-[#22c55e]/5 text-emerald-400! font-semibold";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={btnStyle}
                          >
                            <span className="mr-3 border-2 border-dark-800 bg-black/40 h-5 w-5 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400">
                              {optIdx + 1}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => updateStage('theory')}
                className="mine-btn px-8 py-3.5 text-xs uppercase"
              >
                Back to Theory
              </button>

              {quizPassed ? (
                <button
                  onClick={() => updateStage('code')}
                  className="mine-btn mine-btn-green px-10 py-3.5 text-xs uppercase flex items-center gap-2"
                >
                  <span>Go to Code Practice</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  className="mine-btn mine-btn-green px-10 py-3.5 text-xs uppercase"
                >
                  Submit Answers
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= STAGE 3: INTERACTIVE CODING VIEW ================= */}
      {stage === 'code' && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Instructions Column (40% width) */}
          <section
            className={`flex flex-col h-full bg-dark-900 overflow-y-auto ${
              activeTab === 'instructions' ? 'flex' : 'hidden lg:flex'
            }`}
            style={{ flexBasis: '40%' }}
          >
            {/* Inner Header controls */}
            <div className="sticky top-0 z-10 bg-dark-900 border-b-2 border-dark-800 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 bg-black border-2 border-dark-800 px-3 py-1.5 font-semibold">
                Coding Challenge
              </span>
              <button
                onClick={() => updateStage('theory')}
                className="mine-btn text-[10px] h-8 py-0 uppercase"
              >
                Review Theory
              </button>
            </div>

            {/* Challenge Content */}
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
              <div className="block-panel p-5 space-y-4">
                <h3 className="text-white text-xs uppercase font-bold flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center bg-brand-500 text-black text-xs font-extrabold">!</span>
                  <span>Objective</span>
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-semibold bg-black p-3 border-2 border-dark-800">
                  {lesson.challenge}
                </p>
              </div>

              {/* Example Syntax Reference */}
              {lesson.examples && (
                <div className="block-panel p-5">
                  <h3 className="text-white text-xs uppercase font-bold flex items-center gap-2 mb-2">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#3b82f6] text-white text-[10px] font-extrabold font-mono">i</span>
                    <span>Example Syntax</span>
                  </h3>
                  {renderMarkdown(lesson.examples)}
                </div>
              )}

              {/* Sub-steps explanation (Task step-by-step description) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructions</h4>
                <ul className="list-disc pl-5 text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li>Write your code inside the editor on the right.</li>
                  <li>Click <strong>Run Code</strong> in the header controls to build and inspect output.</li>
                  <li>Ensure all challenge validation tests below are marked passed to complete this lesson.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monaco IDE Workspace (60% width) */}
          <section
            className={`flex-1 flex flex-col h-full border-l-2 border-dark-800 bg-dark-950 ${
              activeTab !== 'instructions' ? 'flex' : 'hidden lg:flex'
            }`}
            style={{ flexBasis: '60%' }}
          >
            {/* Header bar controls */}
            <div className="p-3 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900">
              {/* Mobile tabs */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'instructions' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Objective
                </button>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'editor' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase ${
                    activeTab === 'preview' ? 'bg-brand-500 text-black' : 'text-slate-400'
                  }`}
                >
                  Output
                </button>
              </div>

              <span className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Terminal className="h-4 w-4 text-brand-500" />
                <span>INTERACTIVE EDITOR</span>
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleReset}
                  className="mine-btn mine-btn-red text-xs h-9"
                  title="Reset Code"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleRun}
                  className="mine-btn mine-btn-green text-xs h-9"
                  title="Run code & tests"
                >
                  <Play className="h-3.5 w-3.5 mr-1 fill-black" />
                  <span>Run Code</span>
                </button>
              </div>
            </div>

            {/* Split panels */}
            <div className={`flex-1 relative ${activeTab === 'editor' || activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
              <div className="absolute inset-0 flex flex-col h-full">
                {/* Monaco editor */}
                <div className={`flex-1 min-h-0 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
                  <Editor
                    height="100%"
                    language={lesson.language}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                      padding: { top: 12, bottom: 12 },
                      cursorBlinking: 'smooth',
                      fontFamily: "'JetBrains Mono', Courier, monospace",
                      tabSize: 2,
                    }}
                  />
                </div>

                {/* Live Preview + Tests pane */}
                <div className={`flex-1 border-t-2 border-dark-800 flex flex-col lg:flex-row min-h-0 bg-dark-950 ${
                  activeTab === 'preview' ? 'block' : 'hidden lg:flex'
                }`}>
                  
                  {/* Preview container */}
                  <div className="flex-1 border-b-2 lg:border-b-0 lg:border-r-2 border-dark-800 flex flex-col min-h-[160px] lg:min-h-0">
                    <div className="px-4 py-2 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900 text-xs font-bold uppercase text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MonitorPlay className="h-3.5 w-3.5 text-brand-500" />
                        <span>Output Render</span>
                      </span>
                    </div>
                    <div className="flex-1 bg-[#09090b]">
                      <iframe
                        title="Live Code Preview"
                        srcDoc={previewDoc}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  {/* Tests container */}
                  <div className="flex-1 flex flex-col min-h-[160px] lg:min-h-0 bg-dark-950">
                    <div className="px-4 py-2 border-b-2 border-dark-800 flex items-center justify-between bg-dark-900 text-xs font-bold uppercase text-slate-400">
                      <span>Tests Results</span>
                      {runClicked && (
                        <span>
                          {testResults.filter((t) => t.passed).length} / {testResults.length} OK
                        </span>
                      )}
                    </div>
                    
                    {/* List results */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {testResults.map((test, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start gap-3 border-2 p-3 text-sm ${
                            test.passed === null
                              ? 'border-dark-800 bg-black/45 text-slate-500'
                              : test.passed
                              ? 'border-brand-500/30 bg-brand-500/5 text-slate-300'
                              : 'border-red-500/30 bg-red-500/5 text-slate-300'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {test.passed === null ? (
                              <div className="h-4.5 w-4.5 border-2 border-slate-600 bg-slate-800"></div>
                            ) : test.passed ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-brand-500" />
                            ) : (
                              <XCircle className="h-4.5 w-4.5 text-red-500" />
                            )}
                          </span>

                          <div className="space-y-1">
                            <p>{test.description}</p>
                            {test.error && (
                              <pre className="text-xs text-red-400 overflow-x-auto bg-black/20 p-2 border border-red-500/20 mt-1.5 font-mono">
                                {test.error}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!runClicked && (
                        <div className="text-center py-6 text-slate-500 text-xs uppercase">
                          Click <strong className="text-brand-500">Run Code</strong> to test.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </section>

        </div>
      )}

      {/* 3. SUCCESS CELEBRATION MODAL OVERLAY */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="block-panel w-full max-w-md p-8 text-center relative">
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center bg-brand-500 border border-brand-500 text-black mb-6">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>

            <h3 className="text-lg font-bold text-white uppercase">Challenge Passed!</h3>
            <p className="text-slate-300 mt-4 leading-relaxed">
              Success! You passed all requirements for <strong className="text-brand-500 uppercase">{lesson.title}</strong>.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleNextLessonClick}
                className="mine-btn mine-btn-green w-full uppercase"
              >
                <span>{nextLesson ? 'Next Level' : 'Complete Cert'}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mine-btn w-full uppercase"
              >
                Inspect Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
