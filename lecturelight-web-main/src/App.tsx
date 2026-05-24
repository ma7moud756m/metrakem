import { useEffect, useMemo, useState } from "react";
import {
  Binary,
  Database,
  Sigma,
  BarChart3,
  Network,
  LineChart,
  Moon,
  Sun,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

type Course = {
  id: string;
  name: string;
  icon: LucideIcon;
  accent: string;
  lectures: string[];
};

const COURSES: Course[] = [
  {
    id: "data-structures",
    name: "Data Structures",
    icon: Binary,
    accent: "oklch(0.72 0.17 250)",
    lectures: [
      "Introduction",
      "Searching and Sorting",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Not available yet",
      "Heaps and Heap Sort",
      "Graphs",
      "Hashing",
    ],
  },
  {
    id: "database",
    name: "Database",
    icon: Database,
    accent: "oklch(0.74 0.16 160)",
    lectures: [
      "Introduction to Database Systems",
      "Relational Model and Relational Algebra",
      "Basic SQL",
      "Advanced SQL",
    ],
  },
  {
    id: "numerical-analysis",
    name: "Numerical Analysis",
    icon: Sigma,
    accent: "oklch(0.76 0.16 60)",
    lectures: [
      "Forward Differences",
      "Backward Differences",
      "Operators",
      "Newton’s Forward Interpolation",
      "Newton’s Backward Interpolation",
      "Lagrange’s Interpolation Formula",
      "Lagrange Multipliers",
      "Numerical Integration",
      "Trapezoidal Rule",
      "Simpson’s 1:3 Rule",
    ],
  },
  {
    id: "probability-2",
    name: "Probability 2",
    icon: BarChart3,
    accent: "oklch(0.72 0.17 20)",
    lectures: [
      "Correlation and Regression",
      "Sampling Theory",
      "Sampling Distribution",
      "Point Estimation Methods",
      "Confidence Intervals",
      "Hypothesis Testing",
      "Problems on Hypothesis Testing",
      "Two-Way Tables and Chi-Square Independence Test",
      "Goodness of Fit",
    ],
  },
  {
    id: "computer-network",
    name: "Computer Network",
    icon: Network,
    accent: "oklch(0.72 0.15 290)",
    lectures: [
      "Course Introduction and Exploring the Network",
      "Exploring the Network",
      "Network Protocols and Communications",
      "Network Access",
      "Data Link Layer Protocols",
      "Ethernet",
      "Network Layer",
      "IP Addressing",
      "Subnetting IP Networks",
      "VLSM",
    ],
  },
  {
    id: "web-analytics",
    name: "Web Analytics",
    icon: LineChart,
    accent: "oklch(0.75 0.14 200)",
    lectures: [],
  },
];

const STORAGE_KEY = "study-planner-progress-v1";
const THEME_KEY = "study-planner-theme";

type Progress = Record<string, boolean[]>;

function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Progress;
  } catch {
    return {};
  }
}

export default function App() {
  const [progress, setProgress] = useState<Progress>({});
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loaded = loadProgress();
    const initialized: Progress = {};
    for (const c of COURSES) {
      initialized[c.id] =
        loaded[c.id] && loaded[c.id].length === c.lectures.length
          ? loaded[c.id]
          : new Array(c.lectures.length).fill(false);
    }
    setProgress(initialized);

    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, mounted]);

  const toggle = (courseId: string, idx: number) => {
    setProgress((prev) => {
      const arr = [...(prev[courseId] ?? [])];
      arr[idx] = !arr[idx];
      return { ...prev, [courseId]: arr };
    });
  };

  const { totalLectures, totalCompleted, overallPct } = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const c of COURSES) {
      total += c.lectures.length;
      done += (progress[c.id] ?? []).filter(Boolean).length;
    }
    return {
      totalLectures: total,
      totalCompleted: done,
      overallPct: total ? Math.round((done / total) * 100) : 0,
    };
  }, [progress]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>University Study Planner</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Track your courses and progress
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mark lectures as complete. Your progress is saved automatically.
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Overall progress</div>
              <div className="mt-1 text-2xl font-semibold">
                {totalCompleted}{" "}
                <span className="text-muted-foreground">/ {totalLectures} lectures</span>
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums">{overallPct}%</div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              checks={progress[course.id] ?? []}
              onToggle={(i) => toggle(course.id, i)}
            />
          ))}
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Progress is stored locally on this device.
        </footer>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  checks,
  onToggle,
}: {
  course: Course;
  checks: boolean[];
  onToggle: (i: number) => void;
}) {
  const Icon = course.icon;
  const total = course.lectures.length;
  const done = checks.filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${course.accent} 18%, transparent)`,
            color: course.accent,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{course.name}</h2>
          <p className="text-xs text-muted-foreground">
            {total === 0 ? "No lectures yet" : `${done} of ${total} completed`}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: course.accent,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {total === 0 ? (
          <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No lectures yet
          </li>
        ) : (
          course.lectures.map((title, i) => {
            const checked = !!checks[i];
            return (
              <li key={i}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-accent ${
                    checked ? "text-muted-foreground" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(i)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-foreground"
                  />
                  <span className="text-sm leading-snug">
                    <span className="mr-1.5 font-medium text-foreground/80">L{i + 1}.</span>
                    <span className={checked ? "line-through" : ""}>{title}</span>
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </article>
  );
}
