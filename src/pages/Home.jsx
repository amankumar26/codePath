import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourseProgress } from '../context/CourseProgressContext';
import htmlCourse from '../courses/html-cert.json';
import { Code, Flame, Sparkles, BookOpen, Layers, Terminal, ArrowRight } from 'lucide-react';

export default function Home() {
  const { getCourseProgress } = useCourseProgress();
  const { completedCount, totalCount, percentage } = getCourseProgress(htmlCourse);
  const [resumeUrl, setResumeUrl] = useState('/course/html-cert');

  useEffect(() => {
    const saved = localStorage.getItem('devloperpath_last_visited_url');
    if (saved) {
      setResumeUrl(saved);
    }
  }, []);

  const stats = [
    {
      icon: <Sparkles className="h-6 w-6 text-brand-500" />,
      title: "INTERACTIVE SANDBOX",
      desc: "Write HTML, CSS, and JS inside your browser. No local setup or compiler needed."
    },
    {
      icon: <Flame className="h-6 w-6 text-blue-500" />,
      title: "INSTANT VALIDATION",
      desc: "Run automated tests against your code and see real-time output preview immediately."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      title: "STRUCTURED CURRICULUM",
      desc: "Follow a bite-sized certification curriculum built for complete beginners."
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-dark-950 pb-20">
      {/* Retro Pixel Grid Decoration (Simulated) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-6 pt-16 text-center lg:px-8 sm:pt-24 relative z-10">
        <div className="inline-flex items-center gap-2 border-4 border-brand-500 bg-brand-700/20 px-4 py-2 font-retro text-[10px] text-brand-500 uppercase">
          <Sparkles className="h-4 w-4" />
          <span>Interactive Browser Sandbox MVP</span>
        </div>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white sm:text-5xl uppercase text-shadow-retro">
          Master Modern Web Development <br />
          <span className="text-brand-500">
            One Block at a Time
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Learn HTML, CSS, and JavaScript with structured lessons, an interactive code workspace, live previews, and automated challenges. Build skills directly in your browser.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={resumeUrl}
            className="mine-btn mine-btn-green px-8 py-4 text-xs uppercase"
          >
            <span className="flex items-center gap-2">
              <span>{percentage > 0 ? 'Resume Learning' : 'Start Learning Free'}</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <a
            href="#certifications"
            className="mine-btn px-8 py-4 text-xs uppercase"
          >
            Browse Certifications
          </a>
        </div>
      </div>

      {/* Why Learn Section */}
      <div className="mx-auto max-w-7xl px-6 mt-28 lg:px-8 relative z-10">
        <div className="text-center border-b-4 border-dark-800 pb-8">
          <h2 className="text-xl font-extrabold tracking-tight text-white uppercase text-shadow-retro">
            Why learn on DevloperPath?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Our platform provides hands-on learning that feels less like reading documentation and more like building actual code.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-6 sm:max-w-none sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="block-panel p-6 text-left"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-black bg-dark-900 text-slate-200">
                {stat.icon}
              </div>
              <h3 className="text-xs font-bold text-white tracking-wider mb-2">{stat.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Grid */}
      <div id="certifications" className="mx-auto max-w-7xl px-6 mt-28 lg:px-8 relative z-10">
        <div className="text-center border-b-4 border-dark-800 pb-8">
          <h2 className="text-xl font-extrabold tracking-tight text-white uppercase text-shadow-retro">
            Available Certifications
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Complete the challenges in each module to unlock the next level and earn certificates of completion.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 sm:max-w-none sm:grid-cols-3">
          {/* HTML Certification Card */}
          <div className="block-panel block-panel-hover flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="border-2 border-brand-500 bg-brand-700/20 px-2 py-0.5 text-[9px] font-retro text-brand-500 uppercase">
                  Active
                </span>
                <Code className="h-6 w-6 text-brand-500" />
              </div>
              <h3 className="mt-6 text-xs font-bold text-white uppercase tracking-wider">
                HTML Certification
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Learn HTML elements, structuring paragraphs, inserting multimedia, building tables, and coding forms.
              </p>
            </div>
            
            <div className="mt-8">
              {percentage > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                    <span>Progress:</span>
                    <span className="text-brand-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-black border-2 border-dark-800 h-5 overflow-hidden relative">
                    <div
                      className="bg-brand-500 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <Link
                to={resumeUrl}
                className="mine-btn mine-btn-green w-full text-center"
              >
                <span>{percentage > 0 ? 'Resume Course' : 'Start Course'}</span>
              </Link>
            </div>
          </div>

          {/* CSS Certification Card */}
          <div className="block-panel block-panel-hover-blue flex flex-col justify-between p-6 opacity-75">
            <div>
              <div className="flex items-center justify-between">
                <span className="border-2 border-blue-500 bg-blue-500/10 px-2 py-0.5 text-[9px] font-retro text-blue-500 uppercase">
                  Locked
                </span>
                <Layers className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mt-6 text-xs font-bold text-white uppercase tracking-wider">
                CSS Certification
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Style web pages, master colors, typography, Flexbox, CSS Grid layouts, and micro-interactions.
              </p>
            </div>

            <div className="mt-8">
              <button
                disabled
                className="mine-btn w-full"
              >
                <span>Locked</span>
              </button>
            </div>
          </div>

          {/* JS Certification Card */}
          <div className="block-panel block-panel-hover-purple flex flex-col justify-between p-6 opacity-75">
            <div>
              <div className="flex items-center justify-between">
                <span className="border-2 border-purple-500 bg-purple-500/10 px-2 py-0.5 text-[9px] font-retro text-purple-500 uppercase">
                  Locked
                </span>
                <Terminal className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mt-6 text-xs font-bold text-white uppercase tracking-wider">
                JavaScript Certification
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Understand algorithms, control flow, functions, objects, array methods, and dynamic DOM manipulation.
              </p>
            </div>

            <div className="mt-8">
              <button
                disabled
                className="mine-btn w-full"
              >
                <span>Locked</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
