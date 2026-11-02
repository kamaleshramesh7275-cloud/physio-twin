import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { useLocation } from "wouter";
import {
  ClipboardList, CheckCircle2, Circle, Clock, ChevronRight, Play,
  Search, Filter, Dumbbell, Activity, ShieldCheck, Flame, RotateCcw,
  Pause, Sparkles, Camera, ArrowRight, Check, X, Award, Eye, Info
} from "lucide-react";

export interface ExerciseItem {
  id: string;
  name: string;
  category: "knee-leg" | "spine-core" | "shoulder-neck" | "mobility";
  categoryLabel: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  targetMuscles: string[];
  setsReps: string;
  durationSec: number;
  cameraSupported: boolean;
  captureMode?: "sit-to-stand" | "standing-posture" | "squat-analysis" | "gait-analysis";
  rationale: string;
  cues: string[];
}

export interface ProgramTask {
  id: number;
  exerciseId?: string;
  title: string;
  duration: string;
  completed: boolean;
  rationale: string;
  setsReps?: string;
  cues?: string[];
  captureMode?: "sit-to-stand" | "standing-posture" | "squat-analysis" | "gait-analysis";
}

export interface StructuredProgram {
  id: string;
  title: string;
  category: string;
  week: number;
  totalWeeks: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  todayTasks: ProgramTask[];
}

const MASTER_EXERCISES: ExerciseItem[] = [
  {
    id: "ex-squat",
    name: "Bodyweight Squats",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Beginner",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Patellar Tendon"],
    setsReps: "3 × 10 reps",
    durationSec: 60,
    cameraSupported: true,
    captureMode: "sit-to-stand",
    rationale: "Builds quadriceps deceleration capacity, functioning as the primary muscular shock absorber for the ACL.",
    cues: ["Hips back first before bending knees", "Keep knees tracking over 2nd & 3rd toes", "Chest tall, avoid lumbar rounding"]
  },
  {
    id: "ex-rdl",
    name: "Single-Leg Romanian Deadlifts",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Intermediate",
    targetMuscles: ["Hamstrings", "Gluteus Medius", "Ankle Stabilizers"],
    setsReps: "3 × 8 reps/leg",
    durationSec: 90,
    cameraSupported: true,
    captureMode: "sit-to-stand",
    rationale: "Corrects bilateral hamstring-to-quadriceps strength asymmetry and trains hip hinge mechanics under unilateral load.",
    cues: ["Hinge at hip, not waist", "Keep trailing leg and torso in a straight line", "Slight soft bend in standing knee"]
  },
  {
    id: "ex-lat-walks",
    name: "Banded Lateral Monster Walks",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Beginner",
    targetMuscles: ["Gluteus Medius", "Tensor Fasciae Latae", "Hip Abductors"],
    setsReps: "2 × 15 steps/side",
    durationSec: 60,
    cameraSupported: true,
    captureMode: "standing-posture",
    rationale: "Activates the posterior gluteus medius fibers to directly counteract dynamic knee valgus during deceleration.",
    cues: ["Athletic quarter squat stance", "Lead with the heel, don't let knees cave inward", "Keep tension on the band throughout"]
  },
  {
    id: "ex-wall-slides",
    name: "Thoracic Spine Wall Slides",
    category: "shoulder-neck",
    categoryLabel: "Shoulder & Cervical",
    difficulty: "Beginner",
    targetMuscles: ["Lower Trapezius", "Serratus Anterior", "Thoracic Extensors"],
    setsReps: "3 × 12 reps",
    durationSec: 60,
    cameraSupported: true,
    captureMode: "standing-posture",
    rationale: "Reverses kyphotic postural collapse and restores upward scapular rotation to protect the subacromial joint space.",
    cues: ["Keep lower back flat against the wall", "Wrists, elbows, and forearms maintain contact", "Slide upward smoothly without shrugging upper traps"]
  },
  {
    id: "ex-chin-tuck",
    name: "Deep Cervical Chin Tucks",
    category: "shoulder-neck",
    categoryLabel: "Shoulder & Cervical",
    difficulty: "Beginner",
    targetMuscles: ["Longus Colli", "Longus Capitis", "Suboccipital Extensors"],
    setsReps: "3 × 10 reps (5s hold)",
    durationSec: 60,
    cameraSupported: true,
    captureMode: "standing-posture",
    rationale: "Realigns the cervical plumb line, reducing anterior head carriage shear on the C5-C7 spinal segments.",
    cues: ["Draw chin straight back as if making a double chin", "Avoid tilting head up or down", "Hold 5 seconds with steady breathing"]
  },
  {
    id: "ex-clamshells",
    name: "Side-Lying Banded Clamshells",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Beginner",
    targetMuscles: ["Gluteus Medius", "Piriformis", "Deep Hip Rotators"],
    setsReps: "3 × 15 reps/side",
    durationSec: 75,
    cameraSupported: false,
    rationale: "Isolates the hip external rotators to stabilize pelvic coronal alignment and protect the patellofemoral joint.",
    cues: ["Keep pelvis vertically stacked, do not roll backwards", "Feet stay touching as the top knee opens", "2-second peak isometric squeeze at the top"]
  },
  {
    id: "ex-tke",
    name: "Banded Terminal Knee Extensions (TKE)",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Beginner",
    targetMuscles: ["Vastus Medialis Oblique (VMO)", "Quadriceps Tendon"],
    setsReps: "2 × 20 reps/leg",
    durationSec: 60,
    cameraSupported: true,
    captureMode: "standing-posture",
    rationale: "Reinforces terminal 15° of knee extension to optimize patellar tracking and active joint compression stability.",
    cues: ["Anchor band at knee height", "Deliberately flex VMO at lockout", "Control eccentric return over 2 seconds"]
  },
  {
    id: "ex-deadbug",
    name: "Wall-Press Deadbugs",
    category: "spine-core",
    categoryLabel: "Spine & Core",
    difficulty: "Intermediate",
    targetMuscles: ["Transverse Abdominis", "Internal Obliques", "Psoas"],
    setsReps: "3 × 10 reps/side",
    durationSec: 90,
    cameraSupported: false,
    rationale: "Builds anterior core stiffness to prevent compensatory lumbar hyperextension during athletic locomotion.",
    cues: ["Press palms hard against wall behind head", "Keep lumbar spine completely glued to the floor", "Extend leg slowly without lifting lower back"]
  },
  {
    id: "ex-bird-dog",
    name: "Bird-Dog Isometric Holds",
    category: "spine-core",
    categoryLabel: "Spine & Core",
    difficulty: "Beginner",
    targetMuscles: ["Multifidus", "Erector Spinae", "Gluteus Maximus"],
    setsReps: "3 × 8 reps/side (3s hold)",
    durationSec: 75,
    cameraSupported: false,
    rationale: "Coordinates diagonal muscular sling engagement across the thoracolumbar fascia to shield spinal facet joints.",
    cues: ["Quadruped position with neutral spine", "Reach arm forward and opposite leg back without rotating pelvis", "Imagine balancing a cup of water on your sacrum"]
  },
  {
    id: "ex-copenhagen",
    name: "Copenhagen Adductor Plank",
    category: "knee-leg",
    categoryLabel: "Knee & Lower Body",
    difficulty: "Advanced",
    targetMuscles: ["Adductor Longus", "Adductor Magnus", "Quadratus Lumborum"],
    setsReps: "3 × 20s hold/side",
    durationSec: 90,
    cameraSupported: false,
    rationale: "Significantly decreases groin strain incidence and balances the medial-to-lateral forces acting on the knee.",
    cues: ["Rest top knee/ankle on bench, bottom leg hovered", "Maintain straight line from ear to ankle", "Breathe steadily throughout the isometric hold"]
  },
  {
    id: "ex-calf-drops",
    name: "Eccentric Heel Drops",
    category: "mobility",
    categoryLabel: "Mobility & Foot",
    difficulty: "Beginner",
    targetMuscles: ["Gastrocnemius", "Soleus", "Achilles Tendon"],
    setsReps: "3 × 15 reps/leg",
    durationSec: 60,
    cameraSupported: false,
    rationale: "Promotes tendon collagen remodeling and improves talocrural dorsiflexion to prevent excessive knee compensation.",
    cues: ["Rise on both feet, lower slowly on one foot for 3 seconds", "Drop heel slightly below step level", "Keep knee straight for gastrocnemius, bent for soleus"]
  },
  {
    id: "ex-ytw",
    name: "Prone Scapular Y-T-W Raises",
    category: "shoulder-neck",
    categoryLabel: "Shoulder & Cervical",
    difficulty: "Intermediate",
    targetMuscles: ["Rhomboids", "Middle Trapezius", "Infraspinatus"],
    setsReps: "2 × 8 reps each shape",
    durationSec: 90,
    cameraSupported: false,
    rationale: "Restores scapulohumeral rhythm and strengthens the posterior rotator cuff against forward slouching.",
    cues: ["Thumbs pointing to ceiling in all positions", "Initiate movement from shoulder blades, not neck", "Pause 1 second at top of each repetition"]
  }
];

const MASTER_PROGRAMS: StructuredProgram[] = [
  {
    id: "prog-knee",
    title: "6-Week Knee Stabilization Protocol",
    category: "Physical Therapy",
    week: 3,
    totalWeeks: 6,
    level: "Intermediate",
    duration: "6 Weeks",
    description: "Clinical protocol focusing on patellofemoral stability, gluteus medius firing, and kinetic chain alignment.",
    todayTasks: [
      { id: 1, exerciseId: "ex-warmup", title: "Warm-up: Stationary Bike", duration: "10 min", completed: true, rationale: "Increases synovial fluid production to lubricate the knee joint capsule.", setsReps: "10 min light spin", cues: ["Maintain steady cadence 80-90 RPM", "Keep resistance light to moderate"] },
      { id: 2, exerciseId: "ex-squat", title: "Bodyweight Squats", duration: "3×10 reps", completed: true, rationale: "Builds quadriceps capacity, acting as the primary shock absorber for the ACL.", setsReps: "3 × 10 reps", captureMode: "sit-to-stand", cues: ["Hips back first", "Knees track over toes", "Chest tall"] },
      { id: 3, exerciseId: "ex-rdl", title: "Single-Leg Romanian Deadlifts", duration: "3×8 reps/leg", completed: false, rationale: "Addresses hamstrings-to-quads strength asymmetry and trains unilateral hip balance.", setsReps: "3 × 8 reps/leg", captureMode: "sit-to-stand", cues: ["Hinge at hip, not spine", "Keep pelvis level", "Soft bend in knee"] },
      { id: 4, exerciseId: "ex-lat-walks", title: "Banded Lateral Monster Walks", duration: "2×15 steps/side", completed: false, rationale: "Fires the gluteus medius to prevent dynamic knee valgus collapse.", setsReps: "2 × 15 steps/side", captureMode: "standing-posture", cues: ["Quarter squat stance", "Lead with heel", "Constant band tension"] },
      { id: 5, exerciseId: "ex-tke", title: "Banded Terminal Knee Extensions", duration: "2×20 reps/leg", completed: false, rationale: "Isolates the Vastus Medialis Oblique (VMO) to restore patellar tracking balance.", setsReps: "2 × 20 reps/leg", captureMode: "standing-posture", cues: ["Squeeze quad hard at lockout", "Control the return", "Hold 1s at full extension"] }
    ]
  },
  {
    id: "prog-core",
    title: "Core Fundamentals & Lumbar Shielding",
    category: "Spinal Health",
    week: 1,
    totalWeeks: 4,
    level: "Beginner",
    duration: "4 Weeks",
    description: "Structured anti-extension and anti-rotation drills to build a muscular corset around the lumbar spine.",
    todayTasks: [
      { id: 101, exerciseId: "ex-deadbug", title: "Wall-Press Deadbugs", duration: "3×10 reps/side", completed: false, rationale: "Strengthens deep anterior core without spinal compressive flexion.", setsReps: "3 × 10 reps/side", cues: ["Lower back flat on floor", "Press hands into wall", "Breathe out as leg extends"] },
      { id: 102, exerciseId: "ex-bird-dog", title: "Bird-Dog Isometric Holds", duration: "3×8 reps/side", completed: false, rationale: "Activates multifidus and contralateral posterior sling.", setsReps: "3 × 8 reps/side", cues: ["Maintain level sacrum", "Reach long, not high", "Hold 3s per rep"] },
      { id: 103, exerciseId: "ex-copenhagen", title: "Copenhagen Side Plank", duration: "3×20s/side", completed: false, rationale: "Reinforces lateral subsystem and adductor chain stability.", setsReps: "3 × 20s/side", cues: ["Hips forward and high", "Keep head in line with spine"] }
    ]
  },
  {
    id: "prog-shoulder",
    title: "Cervical & Thoracic Posture Realignment",
    category: "Ergonomics & Posture",
    week: 2,
    totalWeeks: 3,
    level: "Beginner",
    duration: "3 Weeks",
    description: "Counteract desk-bound forward head tilt, thoracic kyphosis, and rounded scapular positioning.",
    todayTasks: [
      { id: 201, exerciseId: "ex-chin-tuck", title: "Deep Cervical Chin Tucks", duration: "3×10 reps", completed: false, rationale: "Retrains deep cervical flexors to offload suboccipital tension.", setsReps: "3 × 10 reps (5s hold)", captureMode: "standing-posture", cues: ["Slide chin back horizontally", "Lengthen back of neck", "Hold 5 seconds"] },
      { id: 202, exerciseId: "ex-wall-slides", title: "Thoracic Spine Wall Slides", duration: "3×12 reps", completed: false, rationale: "Rebuilds upward scapular rotation and opens tight anterior pectorals.", setsReps: "3 × 12 reps", captureMode: "standing-posture", cues: ["Forearms stay flat on wall", "Slide up smoothly", "Engage lower traps"] },
      { id: 203, exerciseId: "ex-ytw", title: "Prone Scapular Y-T-W Raises", duration: "2×8 reps each", completed: false, rationale: "Activates middle and lower trapezius against slouching patterns.", setsReps: "2 × 8 reps each", cues: ["Thumbs point to sky", "Squeeze shoulder blades", "Neck stays relaxed"] }
    ]
  },
  {
    id: "prog-run",
    title: "Return to Running & Impact Readiness",
    category: "Athletic Performance",
    week: 2,
    totalWeeks: 8,
    level: "Advanced",
    duration: "8 Weeks",
    description: "High-compliance protocol preparing tendons, calves, and hips for repetitive ground reaction forces.",
    todayTasks: [
      { id: 301, exerciseId: "ex-calf-drops", title: "Eccentric Heel Drops", duration: "3×15 reps/leg", completed: false, rationale: "Conditions the Achilles tendon for eccentric ground contact deceleration.", setsReps: "3 × 15 reps/leg", cues: ["Slow 3-second descent", "Rise with both feet", "Full ankle excursion"] },
      { id: 302, exerciseId: "ex-rdl", title: "Single-Leg Romanian Deadlifts", duration: "3×8 reps/leg", completed: false, rationale: "Reinforces single-leg pelvic control and posterior chain propulsion.", setsReps: "3 × 8 reps/leg", captureMode: "sit-to-stand", cues: ["Hinge smoothly", "Ground foot through tripod", "Level hips"] },
      { id: 303, exerciseId: "ex-lat-walks", title: "Banded Lateral Monster Walks", duration: "2×15 steps/side", completed: false, rationale: "Shields the knee from coronal collapse during the stance phase of running.", setsReps: "2 × 15 steps/side", captureMode: "standing-posture", cues: ["Maintain low center of gravity", "Drive with lateral hip"] }
    ]
  }
];

export default function ProgramsPage() {
  const [, setLocation] = useLocation();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"today" | "library" | "programs">("today");

  // Selected Program
  const [selectedProgramId, setSelectedProgramId] = useState<string>(() => {
    return localStorage.getItem("physiotwin_active_program_id") || "prog-knee";
  });

  const currentProgram = MASTER_PROGRAMS.find(p => p.id === selectedProgramId) || MASTER_PROGRAMS[0];

  // Tasks state initialized from localStorage or program defaults
  const [tasks, setTasks] = useState<ProgramTask[]>(() => {
    const saved = localStorage.getItem(`physiotwin_tasks_${selectedProgramId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return currentProgram.todayTasks;
  });

  // Keep tasks synced when active program changes
  useEffect(() => {
    const saved = localStorage.getItem(`physiotwin_tasks_${selectedProgramId}`);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setTasks(currentProgram.todayTasks);
  }, [selectedProgramId]);

  // Persist tasks on change
  useEffect(() => {
    localStorage.setItem(`physiotwin_tasks_${selectedProgramId}`, JSON.stringify(tasks));
  }, [tasks, selectedProgramId]);

  // Modal State for Active Exercise Runner
  const [activeExerciseModal, setActiveExerciseModal] = useState<{
    task?: ProgramTask;
    exercise?: ExerciseItem;
  } | null>(null);

  // Timer State for Exercise Runner
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedReps, setCompletedReps] = useState(10);
  const timerRef = useRef<any>(null);

  // Search & Filter for Library
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Timer Interval
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast("Time complete! Great job maintaining form.");
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  // Handle task completion toggle
  const toggleTaskCompleted = (taskId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const justCompleted = updated.find(t => t.id === taskId)?.completed;
      if (justCompleted) {
        showToast("Exercise marked as completed! Digital Twin progress updated.");
      }
      return updated;
    });
  };

  // Launch Exercise Player Modal
  const startExercise = (task: ProgramTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Try to find matching master exercise
    const masterEx = MASTER_EXERCISES.find(ex => ex.id === task.exerciseId || ex.name.toLowerCase() === task.title.toLowerCase());
    setActiveExerciseModal({ task, exercise: masterEx });
    setTimerSeconds(masterEx?.durationSec || 60);
    setIsTimerRunning(true);
    setCompletedReps(10);
  };

  // Launch Exercise from Library
  const startLibraryExercise = (exercise: ExerciseItem) => {
    const dummyTask: ProgramTask = {
      id: Date.now(),
      exerciseId: exercise.id,
      title: exercise.name,
      duration: exercise.setsReps,
      completed: false,
      rationale: exercise.rationale,
      setsReps: exercise.setsReps,
      cues: exercise.cues,
      captureMode: exercise.captureMode
    };
    setActiveExerciseModal({ task: dummyTask, exercise });
    setTimerSeconds(exercise.durationSec || 60);
    setIsTimerRunning(true);
    setCompletedReps(10);
  };

  // Finish Exercise in Modal
  const handleFinishModalExercise = () => {
    if (activeExerciseModal?.task) {
      const targetId = activeExerciseModal.task.id;
      setTasks(prev => prev.map(t => t.id === targetId ? { ...t, completed: true } : t));
      showToast(`Completed ${activeExerciseModal.task.title}! Workout synced.`);
    }
    setActiveExerciseModal(null);
    setIsTimerRunning(false);
  };

  // Navigate to AI Camera Capture
  const handleLaunchCamera = (captureMode?: string) => {
    if (captureMode) {
      sessionStorage.setItem("pt_preferred_capture_mode", captureMode);
    }
    setLocation("/capture");
  };

  // Switch Active Program
  const handleSelectProgram = (prog: StructuredProgram) => {
    setSelectedProgramId(prog.id);
    localStorage.setItem("physiotwin_active_program_id", prog.id);
    setActiveTab("today");
    showToast(`Switched active program to ${prog.title}`);
  };

  // Reset all tasks
  const handleResetTasks = () => {
    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
    showToast("Today's workout session reset.");
  };

  // Mark all tasks completed
  const handleCompleteAll = () => {
    setTasks(prev => prev.map(t => ({ ...t, completed: true })));
    showToast("All daily tasks completed! Exceptional compliance score logged.");
  };

  // Calculate Progress
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filtered Library Exercises
  const filteredExercises = MASTER_EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.rationale.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || ex.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-emerald-500/90 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 border border-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Dumbbell className="w-3.5 h-3.5" /> Clinical Movement System
            </div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              Exercise & Rehabilitation Library
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Physiotherapist-designed movement protocols and real-time kinematic training.
            </p>
          </div>

          {/* Tab Selector Pills */}
          <div className="flex items-center bg-card/80 p-1 rounded-xl border border-border shadow-xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "today"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Today's Protocol
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "library"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" /> Exercise Catalog
            </button>
            <button
              onClick={() => setActiveTab("programs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "programs"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> All Programs
            </button>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: TODAY'S ACTIVE PROTOCOL                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "today" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 anim-fade">
            
            {/* Left 2 Cols: Main Protocol Card & Task List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Program Header Card */}
              <div className="card border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-blue">{currentProgram.category}</span>
                    <span className="badge badge-emerald">{currentProgram.level}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    Week {currentProgram.week} of {currentProgram.totalWeeks}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black mb-1 relative z-10">{currentProgram.title}</h2>
                <p className="text-xs text-muted-foreground max-w-xl mb-4 relative z-10">{currentProgram.description}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 mb-2 flex justify-between text-xs font-bold relative z-10">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Activity className="w-3.5 h-3.5 text-primary" /> Today's Session Completion
                  </span>
                  <span className="font-mono-numbers text-primary">{progressPercent}% ({completedCount}/{tasks.length})</span>
                </div>
                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden relative z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 rounded-full" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>

                {/* Quick Action Shortcuts */}
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCompleteAll}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Done
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button 
                      onClick={handleResetTasks}
                      className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Session
                    </button>
                  </div>

                  <button
                    onClick={() => handleLaunchCamera()}
                    className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Live Camera Tracking Mode
                  </button>
                </div>
              </div>

              {/* Task Checklist Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Prescribed Exercises ({tasks.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">Click card or checkbox to toggle status</span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`card flex items-start sm:items-center p-4 transition-all duration-200 border hover:border-primary/50 cursor-pointer ${
                        task.completed 
                          ? 'bg-card/40 border-border/40 opacity-75' 
                          : 'bg-card hover:bg-card/90 border-border shadow-sm'
                      }`}
                    >
                      {/* Checkbox Trigger */}
                      <button 
                        type="button"
                        onClick={(e) => toggleTaskCompleted(task.id, e)}
                        className="mt-0.5 sm:mt-0 mr-3.5 p-1 rounded-md text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-pointer"
                        title={task.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/60 hover:text-primary" />
                        )}
                      </button>

                      {/* Content Body */}
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold text-sm sm:text-base ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                          {task.completed && (
                            <span className="badge badge-emerald text-[10px] py-0 px-1.5">Completed</span>
                          )}
                          {task.captureMode && (
                            <span className="badge badge-cyan text-[10px] py-0 px-1.5 flex items-center gap-1">
                              <Camera className="w-2.5 h-2.5" /> AI Vision Ready
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-mono-numbers">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.duration}
                          </span>
                          {task.setsReps && (
                            <span>• {task.setsReps}</span>
                          )}
                        </div>

                        {/* Clinical Rationale Box */}
                        <div className="text-[11px] text-muted-foreground mt-2 bg-secondary/20 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                          <strong className="text-primary mr-1">Biomechanical Impact:</strong>
                          {task.rationale}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0 shrink-0">
                        {task.captureMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLaunchCamera(task.captureMode);
                            }}
                            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer"
                            title="Open AI camera for real-time kinematic posture tracking"
                          >
                            <Camera className="w-3 h-3" /> AI Test
                          </button>
                        )}

                        <button 
                          type="button"
                          onClick={(e) => startExercise(task, e)}
                          className={`btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                            task.completed ? 'opacity-80' : 'hover:scale-105'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" /> {task.completed ? "Re-run" : "Start"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Rail: Available Programs Selector & Compliance Stats */}
            <div className="space-y-6">

              {/* Compliance & Readiness Widget */}
              <div className="card border-border/70 bg-card/60">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Digital Twin Adherence
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Weekly Protocol Adherence</span>
                    <span className="font-bold text-emerald-400">92% (Optimal)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Knee Valgus Shielding</span>
                    <span className="font-bold text-primary">+18% vs Baseline</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Symmetry Balance Ratio</span>
                    <span className="font-bold text-cyan-400">0.96 Bilateral</span>
                  </div>
                </div>
              </div>

              {/* Programs Switcher Deck */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Active & Alternate Tracks</h3>
                  <button 
                    onClick={() => setActiveTab("programs")}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {MASTER_PROGRAMS.map((prog) => {
                    const isCurrent = prog.id === selectedProgramId;
                    return (
                      <div 
                        key={prog.id} 
                        onClick={() => handleSelectProgram(prog)}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                          isCurrent 
                            ? 'border-primary/50 bg-primary/10 shadow-xs' 
                            : 'border-border hover:border-primary/40 hover:bg-card/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs group-hover:text-primary transition-colors">
                                {prog.title}
                              </span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {prog.level} • {prog.duration} • {prog.category}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setActiveTab("library")}
                  className="btn-secondary w-full mt-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Browse Full Exercise Catalog
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: EXERCISE LIBRARY (FULL SEARCHABLE CATALOG)                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "library" && (
          <div className="space-y-6 anim-fade">
            
            {/* Search and Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exercises, target muscles, joints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card/90 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All Exercises" },
                  { id: "knee-leg", label: "Knee & Leg" },
                  { id: "spine-core", label: "Spine & Core" },
                  { id: "shoulder-neck", label: "Shoulder & Neck" },
                  { id: "mobility", label: "Mobility" },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="card p-5 border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="badge badge-blue text-[10px]">{exercise.categoryLabel}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exercise.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        exercise.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>

                    <h3 className="font-bold text-base group-hover:text-primary transition-colors mb-1">
                      {exercise.name}
                    </h3>

                    <div className="text-xs text-muted-foreground font-mono-numbers mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {exercise.setsReps}
                    </div>

                    {/* Muscle Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {exercise.targetMuscles.map((m, idx) => (
                        <span key={idx} className="bg-secondary/30 text-muted-foreground text-[10px] px-2 py-0.5 rounded-md font-medium">
                          {m}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {exercise.rationale}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 mt-auto">
                    {exercise.cameraSupported ? (
                      <button
                        onClick={() => handleLaunchCamera(exercise.captureMode)}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer"
                        title="Analyze movement with live computer vision"
                      >
                        <Camera className="w-3.5 h-3.5" /> AI Camera
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" /> Guided Timer
                      </span>
                    )}

                    <button
                      onClick={() => startLibraryExercise(exercise)}
                      className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" /> Start Exercise
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="text-center py-16 card max-w-md mx-auto">
                <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h4 className="font-bold text-sm">No exercises matched "{searchQuery}"</h4>
                <p className="text-xs text-muted-foreground mt-1">Try searching for other terms like quad, shoulder, or mobility.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
                  className="btn-secondary mt-4 text-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 3: ALL STRUCTURED PROGRAMS                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "programs" && (
          <div className="space-y-6 anim-fade max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MASTER_PROGRAMS.map((prog) => {
                const isCurrent = prog.id === selectedProgramId;
                return (
                  <div 
                    key={prog.id}
                    className={`card p-6 border transition-all flex flex-col justify-between ${
                      isCurrent 
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/40' 
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-blue">{prog.category}</span>
                        {isCurrent ? (
                          <span className="badge badge-emerald font-bold">Currently Active</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold">{prog.duration}</span>
                        )}
                      </div>

                      <h3 className="text-lg font-black mb-2">{prog.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{prog.description}</p>

                      <div className="space-y-2 mb-4 bg-secondary/15 p-3 rounded-xl border border-border/40">
                        <div className="text-[11px] font-bold text-foreground mb-1">Prescribed Focus Exercises:</div>
                        {prog.todayTasks.map((t, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span>{t.title}</span>
                            <span className="text-[10px] text-muted-foreground/80 font-mono-numbers">({t.duration})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Difficulty: <strong className="text-foreground">{prog.level}</strong></span>
                      <button
                        onClick={() => handleSelectProgram(prog)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'btn-primary'
                        }`}
                      >
                        {isCurrent ? "Active Protocol" : "Set as Active Track"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ACTIVE EXERCISE WORKOUT MODAL / RUNNER                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md anim-fade">
          <div className="card w-full max-w-lg bg-card border-border shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">
                    {activeExerciseModal.task?.title || activeExerciseModal.exercise?.name}
                  </h3>
                  <div className="text-[11px] text-muted-foreground">
                    {activeExerciseModal.exercise?.categoryLabel || "Active Biomechanical Protocol"}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setActiveExerciseModal(null); setIsTimerRunning(false); }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-5">
              
              {/* Giant Timer & Rep Counter Card */}
              <div className="bg-secondary/20 border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Interval Countdown
                </div>
                
                {/* Big Timer Display */}
                <div className="text-5xl font-black font-mono-numbers text-foreground tracking-tight my-1">
                  {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Resume
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTimerSeconds(activeExerciseModal.exercise?.durationSec || 60);
                      setIsTimerRunning(false);
                    }}
                    className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rep Counter */}
                <div className="mt-4 pt-3 border-t border-border/40 w-full flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Reps Performed:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompletedReps(r => Math.max(0, r - 1))}
                      className="w-7 h-7 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-numbers font-black text-sm w-6 text-center">{completedReps}</span>
                    <button
                      onClick={() => setCompletedReps(r => r + 1)}
                      className="w-7 h-7 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Cues Checklist */}
              {activeExerciseModal.exercise?.cues && activeExerciseModal.exercise.cues.length > 0 && (
                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Key Kinematic Form Cues
                  </div>
                  <div className="space-y-1.5">
                    {activeExerciseModal.exercise.cues.map((cue, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{cue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rationale Notice */}
              <div className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Rationale:</strong> {activeExerciseModal.task?.rationale || activeExerciseModal.exercise?.rationale}
                </span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              {(activeExerciseModal.task?.captureMode || activeExerciseModal.exercise?.captureMode) ? (
                <button
                  type="button"
                  onClick={() => handleLaunchCamera(activeExerciseModal.task?.captureMode || activeExerciseModal.exercise?.captureMode)}
                  className="btn-secondary w-full sm:w-auto px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Track with AI Camera
                </button>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => { setActiveExerciseModal(null); setIsTimerRunning(false); }}
                  className="btn-secondary px-4 py-2.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishModalExercise}
                  className="btn-primary px-6 py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete Exercise
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
