# 🚀 DevloperPath - Interactive Web Development Learning Platform

**DevloperPath** is an interactive, completely client-side learning platform built for complete beginners to master HTML, CSS, and JavaScript. Drawing inspiration from platforms like *freeCodeCamp*, DevloperPath offers structured paths, conceptual trivia, step-by-step instructions, automated tests, and live visual output rendering directly inside the browser.

---

## 🎨 Core Features

### 1. Progressive 3-Stage Study Flow
Every lesson guides students sequentially through three learning checkpoints:
* **Stage 1: Core Theory & Concept**: Highly legible prose explanations outlining HTML tags, semantics, accessibility best practices, and code syntax references.
* **Stage 2: Conceptual Quiz**: Multiple-choice trivia loaded dynamically from a quiz database. Provides instant correction highlights (emerald for correct, red for incorrect) to test comprehension before coding.
* **Stage 3: Interactive Coding Sandbox**: A professional split-pane layout featuring objective guidelines, a custom Monaco Code Editor, a live rendering output window, and automated test validation.

### 2. Codelab Workshops (Cumulative Projects)
At the end of modules, students apply their knowledge to build cumulative step-by-step projects (e.g. *Personal Portfolio Page*, *Recipe Page*, and *Survey Form*). The dashboard syllabus renders a visual progress map of step grids allowing users to skip, review, or resume sequential steps easily.

### 3. Client-Side Test Validation Engine
Leverages custom DOMParser assertions executing dynamically inside the browser. It parses user-written code into a virtual document, runs programmatic assertions, and prints descriptive pass/fail feedback and runtime errors in real time.

### 4. Zero-Loss State Persistence
All states are synchronized with the browser's `localStorage` immediately upon user action under the unified `devloperpath_` key namespace:
* **Draft Codes**: Keystrokes in Monaco Editor are saved dynamically on every keypress per lesson and per workshop step.
* **Quiz History**: Remembers selected answers, submit states, and passed status to prevent re-entering answers.
* **UI Preferences**: syllabus collapsed/expanded accordion selections persist between sessions.
* **Resume Location**: Tracks the last visited lesson workspace, allowing users to return directly to their active page via the **"Resume Learning"** button.

---

## 📂 Project Architecture

```
DevloperPath/
├── public/                 # Static public assets
├── src/
│   ├── assets/            # SVG icons, styling graphics, and assets
│   ├── components/
│   │   └── Navbar.jsx     # Header with global progress tracker HUD and atomic reset action
│   ├── context/
│   │   └── CourseProgressContext.jsx # LocalStorage progress states (completed lessons, workshop steps)
│   ├── courses/
│   │   ├── html-cert.json # Course syllabus database (10 lessons, validation asserts, workshop projects)
│   │   └── quizzes.js     # Multiple-choice quiz database mapped per lesson
│   ├── pages/
│   │   ├── Home.jsx       # Landing page detailing certifications, stats, and course resume actions
│   │   ├── CoursePage.jsx # Collapsible freeCodeCamp-style syllabus accordion map
│   │   ├── LessonPage.jsx # Multi-stage workspace (Theory view, Quiz widget, Monaco Split editor, Preview iframe)
│   │   └── NotFound.jsx   # Custom 404 page
│   ├── utils/
│   │   └── testRunner.js  # Compilation engine executing test assertions against parsed HTML DOM
│   ├── App.jsx            # Router and Provider wrapping main routes
│   └── index.css          # Styled HUD design system stylesheet
├── package.json           # Scripts and dependency lists
├── tailwind.config.js     # Custom color tokens and layout utilities
└── vite.config.js         # Build tooling configurations
```

---

## 🛠️ Local Development & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* npm (v8+ recommended)

### 1. Clone & Install Dependencies
Clone the repository and install packages:
```bash
npm install
```

### 2. Spin Up Dev Server
Start the local hot-reloading development server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the application.

### 3. Production Build
Bundle and minify the client-side files for hosting:
```bash
npm run build
```
The output files will be built into the `/dist` directory.

---

## 🛡️ Theme Design System
DevloperPath utilizes a custom retro-modern HUD theme:
* **Backgrounds**: Signature deep navy `#0a0a23` and dark steel slate `#1b1b32`.
* **Borders**: Sharp solid `#2a2a40` borders with box-shadow offsets.
* **Typography**: Modern headings with *Plus Jakarta Sans* and code segments with *JetBrains Mono*.
* **Buttons**: Emerald green (`#22c55e`), sky blue (`#3b82f6`), and alert red (`#ef4444`) with offset press animations.
