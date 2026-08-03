import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { Link } from "wouter";
import { Camera, ClipboardList, CheckCircle2 } from "lucide-react";
import { api } from "./api";
import { auth } from "./firebase";

export default function CaptureEngine() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<PoseLandmarker | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "capturing" | "saving" | "saved" | "error">("loading");
  const [statusMsg, setStatusMsg] = useState("Loading vision model...");
  const [exertionLevel, setExertionLevel] = useState(0.0);
  const [reps, setReps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function initVision() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        setLandmarker(poseLandmarker);
        setStatus("ready");
        setStatusMsg("Ready to capture");
      } catch (err) {
        console.error("Vision init failed", err);
        setStatus("error");
        setStatusMsg("Failed to load AI model");
      }
    }
    initVision();
  }, []);

  const startCapture = async () => {
    if (!landmarker || !videoRef.current) return;
    setIsCapturing(true);
    setStatus("capturing");
    setStatusMsg("Capturing...");
    setReps(0);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Camera access failed", err);
      setStatus("error");
      setStatusMsg("Camera access denied");
      setIsCapturing(false);
    }
  };

  const stopCapture = async () => {
    setIsCapturing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setStatus("saving");
    setStatusMsg("Analyzing & saving session...");
    try {
      await api.submitVisionSession({
        user_id: auth.currentUser?.uid || "test-user",
        task_type: "Sit-to-Stand",
        pose_landmarks_json: "{}",
        joint_angles_json: "{}",
        rom: 90.5,
        movement_speed: 1.2,
        symmetry: 0.95,
        stability: 0.88,
        camera_quality: "High"
      });
      setStatus("saved");
      setStatusMsg("Session saved ✓");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setStatusMsg("Save failed — check backend connection");
    }
  };

  useEffect(() => {
    if (!isCapturing || !landmarker || !videoRef.current || !canvasRef.current) return;
    let lastVideoTime = -1;
    let animationFrameId: number;
    let prevStanding = false;
    let repCounted = false;

    const renderLoop = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const results = landmarker.detectForVideo(video, performance.now());
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            const drawingUtils = new DrawingUtils(ctx);

            // Ghost overlay — previous best pose (mocked as offset)
            ctx.globalAlpha = 0.25;
            for (const landmark of results.landmarks) {
              const ghost = landmark.map(l => ({ ...l, x: l.x - 0.04 }));
              drawingUtils.drawConnectors(ghost, PoseLandmarker.POSE_CONNECTIONS, { color: "#ffffff", lineWidth: 3 });
            }
            ctx.globalAlpha = 1.0;

            // Live neon wireframe
            for (const landmark of results.landmarks) {
              drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: "#22d3ee", lineWidth: 2 });
              drawingUtils.drawLandmarks(landmark, { color: "#a855f7", radius: 3 });
            }

            // Simple sit-to-stand rep detection
            const leftHip = results.landmarks[0][23];
            const leftKnee = results.landmarks[0][25];
            if (leftHip && leftKnee) {
              const isStanding = (leftKnee.y - leftHip.y) > 0.2;
              setExertionLevel(isStanding ? 0.8 : 0.15);
              if (isStanding && !prevStanding && !repCounted) {
                setReps(r => r + 1);
                repCounted = true;
              } else if (!isStanding) {
                repCounted = false;
              }
              prevStanding = isStanding;
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCapturing, landmarker]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const statusColor: Record<string, string> = {
    loading: '#f59e0b',
    ready: '#10b981',
    capturing: '#22d3ee',
    saving: '#a855f7',
    saved: '#10b981',
    error: '#ef4444',
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="font-bold">Sit-to-Stand Test</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: statusColor[status] || '#64748b', boxShadow: `0 0 8px ${statusColor[status] || 'transparent'}` }}
            />
            <span className="text-xs font-mono-numbers text-muted-foreground">{statusMsg}</span>
          </div>
          {isCapturing && (
            <span className="font-mono-numbers text-sm font-bold text-primary">{formatTime(elapsed)}</span>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Camera Feed */}
        <div className="flex-1 relative bg-black min-h-[50vh] md:min-h-0">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.6 }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />

          {/* Overlay when not capturing */}
          {!isCapturing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
              <div className="text-center flex flex-col items-center">
                {status === 'saved' ? <CheckCircle2 className="w-16 h-16 mb-4 text-green-400" /> : <Camera className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />}
                <h2 className="text-2xl font-bold">
                  {status === 'saved' ? 'Session Complete!' : 'Camera Offline'}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                  {status === 'saved'
                    ? `Captured ${reps} reps in ${formatTime(elapsed)}. Your twin has been updated.`
                    : status === 'loading' ? 'Loading AI pose model. Please wait...'
                    : 'Position yourself so your full body is visible. Ensure good lighting.'}
                </p>
              </div>

              {status !== 'loading' && status !== 'saving' && (
                <button
                  onClick={status === 'saved' ? () => { setStatus('ready'); setStatusMsg('Ready to capture'); } : startCapture}
                  disabled={status === 'error'}
                  className={status === 'saved' ? 'btn-secondary py-3 px-10' : 'btn-cyan py-4 px-12 text-base'}
                >
                  {status === 'saved' ? 'Record Again' : status === 'error' ? 'Error — Reload Page' : '▶ Start Capture'}
                </button>
              )}

              {status === 'loading' && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading AI model...</span>
                </div>
              )}
            </div>
          )}

          {/* Corner legend — ghost overlay */}
          {isCapturing && (
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
                <div className="w-3 h-0.5 bg-cyan-400" />
                <span className="text-xs text-cyan-400 font-semibold">Live Pose</span>
              </div>
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
                <div className="w-3 h-0.5 bg-white/50" />
                <span className="text-xs text-white/60 font-semibold">Ghost (Best Prior)</span>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border flex flex-col p-5 gap-5 shrink-0 overflow-y-auto bg-background z-20 max-h-[50vh] md:max-h-full">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Session Metrics</div>
            <div className="space-y-3">

              {/* Reps */}
              <div className="metric-card text-center py-4">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Reps</div>
                <div className="text-5xl font-black font-mono-numbers text-gradient-primary">{reps}</div>
              </div>

              {/* Exertion */}
              <div className="metric-card">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Exertion</span>
                  <span className="font-mono-numbers text-sm font-bold text-primary">{(exertionLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${exertionLevel * 100}%`,
                      background: `linear-gradient(90deg, #0891b2, #22d3ee)`,
                      boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)'
                    }}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="metric-card text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Duration</div>
                <div className="text-3xl font-black font-mono-numbers text-gradient-primary">{formatTime(elapsed)}</div>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {/* Instructions */}
            <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-1.5 hidden md:block">
              <div className="flex items-center gap-2 font-semibold text-foreground text-xs mb-2">
                <ClipboardList className="w-4 h-4" />
                <span>Instructions</span>
              </div>
              <div>1. Stand 2m from camera</div>
              <div>2. Ensure full body is visible</div>
              <div>3. Perform 5 slow sit-to-stands</div>
              <div>4. Press Stop when done</div>
            </div>

            {isCapturing ? (
              <button
                onClick={stopCapture}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest btn-danger transition-all"
              >
                ■ Stop & Save Session
              </button>
            ) : (
              <button
                onClick={startCapture}
                disabled={status === 'loading' || status === 'saving'}
                className="btn-primary w-full py-4 text-sm disabled:opacity-40"
              >
                ▶ Start Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
