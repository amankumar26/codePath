import React, { createContext, useContext, useState, useEffect } from 'react';

const CourseProgressContext = createContext();

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};

export const CourseProgressProvider = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const stored = localStorage.getItem('codepath_completed_lessons');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse progress from localStorage', e);
      return [];
    }
  });

  const [completedWorkshopSteps, setCompletedWorkshopSteps] = useState(() => {
    try {
      const stored = localStorage.getItem('codepath_completed_workshop_steps');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to parse workshop steps from localStorage', e);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('codepath_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('codepath_completed_workshop_steps', JSON.stringify(completedWorkshopSteps));
  }, [completedWorkshopSteps]);

  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const completeWorkshopStep = (lessonId, stepNum, totalSteps) => {
    setCompletedWorkshopSteps((prev) => {
      const steps = prev[lessonId] || [];
      if (steps.includes(stepNum)) return prev;
      
      const newSteps = [...steps, stepNum].sort((a, b) => a - b);
      const updated = {
        ...prev,
        [lessonId]: newSteps
      };

      // Check if all steps from 1 to totalSteps are completed
      let allStepsDone = true;
      for (let s = 1; s <= totalSteps; s++) {
        if (!newSteps.includes(s)) {
          allStepsDone = false;
          break;
        }
      }

      if (allStepsDone) {
        completeLesson(lessonId);
      }

      return updated;
    });
  };

  const isWorkshopStepCompleted = (lessonId, stepNum) => {
    const steps = completedWorkshopSteps[lessonId] || [];
    return steps.includes(stepNum);
  };

  const getLatestUnlockedWorkshopStep = (lessonId, totalSteps) => {
    const steps = completedWorkshopSteps[lessonId] || [];
    // The latest unlocked step is the first step that is NOT completed
    for (let s = 1; s <= totalSteps; s++) {
      if (!steps.includes(s)) {
        return s;
      }
    }
    return totalSteps; // If all completed, return total
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      setCompletedLessons([]);
      setCompletedWorkshopSteps({});
      
      // Clear all codePath specific keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('codepath_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    }
    return false;
  };

  const getCourseProgress = (courseData) => {
    if (!courseData || !courseData.modules) return { completedCount: 0, totalCount: 0, percentage: 0 };
    
    let totalCount = 0;
    let completedCount = 0;

    courseData.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        totalCount++;
        if (completedLessons.includes(les.id)) {
          completedCount++;
        }
      });
    });

    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return { completedCount, totalCount, percentage };
  };

  return (
    <CourseProgressContext.Provider
      value={{
        completedLessons,
        completeLesson,
        isLessonCompleted,
        completedWorkshopSteps,
        completeWorkshopStep,
        isWorkshopStepCompleted,
        getLatestUnlockedWorkshopStep,
        resetProgress,
        getCourseProgress,
      }}
    >
      {children}
    </CourseProgressContext.Provider>
  );
};
