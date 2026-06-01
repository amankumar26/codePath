import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CourseProgressProvider } from './context/CourseProgressContext';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <CourseProgressProvider>
      <Router>
        <div className="min-h-screen bg-dark-950 text-slate-200 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CourseProgressProvider>
  );
}
